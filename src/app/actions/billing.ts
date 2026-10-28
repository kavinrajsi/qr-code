"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import * as zod from "zod";
import { getDatabase, schema } from "@/database";
import { requireUser, assertStoreAction } from "@/lib/session";
import { recordAuditEntry } from "@/lib/audit";
import { CREDIT_PACKS, isCreditPack } from "@/lib/billing/config";
import { grantPurchase } from "@/lib/billing/credits";
import { publicKeyId, razorpay, verifyCheckoutSignature } from "@/lib/billing/razorpay";
import { environment } from "@/lib/environment";

export async function createCreditOrder(formData: FormData) {
  const user = await requireUser();
  const storeIdentifier = String(formData.get("storeId"));
  await assertStoreAction(user, storeIdentifier, "billing.pay");

  const creditCount = Number(formData.get("credits"));
  if (!isCreditPack(creditCount)) throw new Error(`Pick one of: ${CREDIT_PACKS.join(", ")} credits`);

  const amountInPaise = creditCount * environment().CREDIT_PRICE_PAISE;
  const razorpayOrder = await razorpay().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt: `qr_${storeIdentifier.slice(0, 8)}_${Date.now()}`,
    notes: { storeId: storeIdentifier, credits: String(creditCount) },
  });

  await getDatabase().insert(schema.payments).values({
    storeId: storeIdentifier,
    userId: user.id,
    credits: creditCount,
    amountPaise: amountInPaise,
    razorpayOrderId: razorpayOrder.id,
  });

  // Only public values go to the browser: order identifier, amount, public key identifier.
  return {
    orderId: razorpayOrder.id,
    amount: amountInPaise,
    currency: "INR",
    keyId: publicKeyId(),
    credits: creditCount,
  };
}

const checkoutVerificationSchema = zod.object({
  razorpay_order_id: zod.string().min(1),
  razorpay_payment_id: zod.string().min(1),
  razorpay_signature: zod.string().min(1),
  storeId: zod.uuid(),
});

// Called by the browser after Checkout succeeds. The webhook is the backstop.
export async function confirmCheckout(input: zod.infer<typeof checkoutVerificationSchema>) {
  const user = await requireUser();
  const checkoutData = checkoutVerificationSchema.parse(input);
  await assertStoreAction(user, checkoutData.storeId, "billing.pay");

  if (
    !verifyCheckoutSignature(
      checkoutData.razorpay_order_id,
      checkoutData.razorpay_payment_id,
      checkoutData.razorpay_signature,
    )
  ) {
    throw new Error("Payment signature did not verify");
  }
  const result = await grantPurchase({
    orderId: checkoutData.razorpay_order_id,
    paymentId: checkoutData.razorpay_payment_id,
  });
  await recordAuditEntry(user.id, "billing.confirm", checkoutData.storeId);
  revalidatePath(`/stores/${checkoutData.storeId}/billing`);
  return { result };
}

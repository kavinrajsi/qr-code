import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/database";

export async function creditBalance(storeId: string): Promise<number> {
  const [balanceRecord] = await getDatabase()
    .select({ balance: sql<number>`coalesce(sum(${schema.creditLedger.delta}), 0)::int` })
    .from(schema.creditLedger)
    .where(eq(schema.creditLedger.storeId, storeId));
  return balanceRecord?.balance ?? 0;
}

// Marks a Razorpay order paid and credits the store exactly once.
// Safe to call from both the checkout verify step and the webhook.
export async function grantPurchase(input: {
  orderId: string;
  paymentId: string;
}): Promise<"granted" | "already" | "unknown"> {
  const database = getDatabase();
  return database.transaction(async (transaction) => {
    const [payment] = await transaction
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.razorpayOrderId, input.orderId))
      .for("update")
      .limit(1);
    if (!payment) return "unknown";
    if (payment.status === "paid") return "already";

    await transaction
      .update(schema.payments)
      .set({ status: "paid", razorpayPaymentId: input.paymentId, paidAt: new Date() })
      .where(eq(schema.payments.id, payment.id));

    await transaction.insert(schema.creditLedger).values({
      storeId: payment.storeId,
      delta: payment.credits,
      reason: "purchase",
      reference: input.paymentId,
    });

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${payment.id.slice(0, 8).toUpperCase()}`;
    const [store] = await transaction
      .select({ gstin: schema.stores.gstin })
      .from(schema.stores)
      .where(eq(schema.stores.id, payment.storeId))
      .limit(1);

    await transaction.insert(schema.invoices).values({
      paymentId: payment.id,
      storeId: payment.storeId,
      number: invoiceNumber,
      amountPaise: payment.amountPaise,
      credits: payment.credits,
      gstin: store?.gstin ?? null,
    });
    return "granted";
  });
}

export async function markPaymentFailed(orderId: string): Promise<void> {
  await getDatabase()
    .update(schema.payments)
    .set({ status: "failed" })
    .where(and(eq(schema.payments.razorpayOrderId, orderId), eq(schema.payments.status, "created")));
}

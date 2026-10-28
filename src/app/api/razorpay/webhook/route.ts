import { grantPurchase, markPaymentFailed } from "@/lib/billing/credits";
import { verifyWebhookSignature } from "@/lib/billing/razorpay";

type RazorpayWebhookEvent = {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string } };
  };
};

// Source of truth for payment state. Signature is checked on the raw body
// before anything is parsed or written.
export async function POST(request: Request) {
  const rawRequestBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  if (!signature || !verifyWebhookSignature(rawRequestBody, signature)) {
    return new Response("invalid signature", { status: 400 });
  }

  const webhookEvent = JSON.parse(rawRequestBody) as RazorpayWebhookEvent;
  const paymentEntity = webhookEvent.payload.payment?.entity;

  if (webhookEvent.event === "payment.captured" && paymentEntity) {
    await grantPurchase({ orderId: paymentEntity.order_id, paymentId: paymentEntity.id });
  } else if (webhookEvent.event === "payment.failed" && paymentEntity) {
    await markPaymentFailed(paymentEntity.order_id);
  }
  return new Response("ok", { status: 200 });
}

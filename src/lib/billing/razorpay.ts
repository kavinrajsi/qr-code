import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { environment } from "@/lib/environment";

let razorpayClient: Razorpay | undefined;

export function razorpay(): Razorpay {
  if (!razorpayClient) {
    const loadedEnvironment = environment();
    razorpayClient = new Razorpay({
      key_id: loadedEnvironment.RAZORPAY_KEY_ID,
      key_secret: loadedEnvironment.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayClient;
}

export function publicKeyId(): string {
  return environment().RAZORPAY_KEY_ID;
}

function isSameHexDigest(expectedDigest: string, receivedDigest: string): boolean {
  const expectedBytes = Buffer.from(expectedDigest, "utf8");
  const receivedBytes = Buffer.from(receivedDigest, "utf8");
  return expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

// Checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret).
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expectedDigest = createHmac("sha256", environment().RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return isSameHexDigest(expectedDigest, signature);
}

// Webhook signature: HMAC_SHA256(raw body, webhook secret).
export function verifyWebhookSignature(rawRequestBody: string, signature: string): boolean {
  const expectedDigest = createHmac("sha256", environment().RAZORPAY_WEBHOOK_SECRET)
    .update(rawRequestBody)
    .digest("hex");
  return isSameHexDigest(expectedDigest, signature);
}

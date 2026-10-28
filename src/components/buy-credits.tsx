"use client";

import { useRouter } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { confirmCheckout, createCreditOrder } from "@/app/actions/billing";

type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

function loadRazorpayCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const scriptElement = document.createElement("script");
    scriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
    scriptElement.onload = () => resolve();
    scriptElement.onerror = () => reject(new Error("Could not load Razorpay Checkout"));
    document.body.appendChild(scriptElement);
  });
}

export function BuyCredits({ storeId, credits, label }: { storeId: string; credits: number; label: string }) {
  const router = useRouter();

  async function startPurchase() {
    const orderForm = new FormData();
    orderForm.set("storeId", storeId);
    orderForm.set("credits", String(credits));
    const razorpayOrder = await createCreditOrder(orderForm);
    await loadRazorpayCheckoutScript();
    if (!window.Razorpay) throw new Error("Checkout unavailable");

    await new Promise<void>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: razorpayOrder.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.orderId,
        name: "QR Studio",
        description: `${credits} QR credits`,
        handler: (checkoutResponse) => {
          confirmCheckout({ ...checkoutResponse, storeId })
            .then(() => {
              router.refresh();
              resolve();
            })
            .catch(reject);
        },
        modal: { ondismiss: () => resolve() },
      });
      checkout.open();
    });
  }

  return <Button label={label} variant="primary" clickAction={startPurchase} />;
}

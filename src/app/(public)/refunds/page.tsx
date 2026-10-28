import type { Metadata } from "next";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Refund policy · QR Studio",
  description: "When QR Studio credits can and cannot be refunded.",
};

export default function RefundsPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Refund policy</Heading>
        <Text>Last updated: [DATE]</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Used credits</Heading>
        <Text>Credits that have been used to create codes are not refundable.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Unused credits</Heading>
        <Text>
          Unused credits can be refunded within 7 days of purchase if a payment failed or was charged more than once.
        </Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>How to ask</Heading>
        <Text>
          Email [SUPPORT EMAIL] with your store name and Razorpay payment ID. We will reply with the outcome.
        </Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Refund timing</Heading>
        <Text>Approved refunds go back to your original payment method. [REFUND PROCESSING TIME]</Text>
      </VStack>
    </VStack>
  );
}

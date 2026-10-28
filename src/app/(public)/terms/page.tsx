import type { Metadata } from "next";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Terms of service · QR Studio",
  description: "The rules for using QR Studio.",
};

export default function TermsPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Terms of service</Heading>
        <Text>Last updated: [DATE]</Text>
        <Text>By using QR Studio you agree to these terms.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>The service</Heading>
        <Text>QR Studio lets you create vCard, URL and map QR codes, including dynamic codes that redirect through our short link.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Accounts</Heading>
        <Text>You sign in with Google. You are responsible for activity on your account and for the stores you manage.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Acceptable use</Heading>
        <Text>Do not use QR Studio to:</Text>
        <Text>- send people to illegal, harmful or deceptive content, or to malware or phishing pages;</Text>
        <Text>- create codes for content you do not have the right to share;</Text>
        <Text>- attempt to break, overload or access other people's stores or data.</Text>
        <Text>We may disable codes or accounts that break these rules.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Credits and payments</Heading>
        <Text>
          Each new QR code uses one credit. Credits are sold in packs and paid for through Razorpay. Prices are shown
          on the site and in your store's billing page.
        </Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Refunds</Heading>
        <Text>See our Refund policy.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Liability</Heading>
        <Text>[LIABILITY TERMS]</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Governing law</Heading>
        <Text>[GOVERNING LAW AND COURTS]</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Contact</Heading>
        <Text>Questions about these terms: [SUPPORT EMAIL].</Text>
      </VStack>
    </VStack>
  );
}

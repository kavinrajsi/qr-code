import type { Metadata } from "next";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Privacy policy · QR Studio",
  description: "What QR Studio collects, why, and how we protect it.",
};

export default function PrivacyPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Privacy policy</Heading>
        <Text>Last updated: [DATE]</Text>
        <Text>This policy explains what QR Studio collects and how we use it.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>What we collect</Heading>
        <Text>
          When you sign in with Google, we receive your name and email address. We store your email only as a scrambled
          code (a keyed hash), not as plain text.
        </Text>
        <Text>
          When someone scans one of your codes, we record the time and the code scanned. We keep only a scrambled
          version of the scanner's IP address.
        </Text>
        <Text>
          Payments are processed by Razorpay. We do not store card details. We keep the order and payment status needed
          to add your credits.
        </Text>
        <Text>The vCard and URL or map details you enter in a code are stored so the code can work.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>How we use it</Heading>
        <Text>To sign you in, run your stores and codes, add purchased credits, show your scan history, and keep the service secure.</Text>
        <Text>We do not sell your personal data.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Retention</Heading>
        <Text>[RETENTION PERIOD]. You can ask us to delete your account by contacting us.</Text>
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Contact</Heading>
        <Text>Privacy questions: [SUPPORT EMAIL]. Our address: [REGISTERED ADDRESS].</Text>
      </VStack>
    </VStack>
  );
}

import type { Metadata } from "next";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Contact · QR Studio",
  description: "How to reach QR Studio support and our registered address.",
};

export default function ContactPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Contact</Heading>
        <Text>Questions, billing problems or account issues? Email us and we will reply as soon as we can.</Text>
      </VStack>

      <Card padding={4} elevation="low">
        <VStack gap={3}>
          <VStack gap={1}>
            <Heading level={3}>Support email</Heading>
            <Text>
              <a href="mailto:[SUPPORT EMAIL]">[SUPPORT EMAIL]</a>
            </Text>
          </VStack>
          <VStack gap={1}>
            <Heading level={3}>Registered address</Heading>
            <Text>[REGISTERED ADDRESS]</Text>
          </VStack>
          <VStack gap={1}>
            <Heading level={3}>Response time</Heading>
            <Text>[RESPONSE TIME]</Text>
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );
}

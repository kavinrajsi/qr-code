import type { Metadata } from "next";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

export const metadata: Metadata = {
  title: "Features · QR Studio",
  description: "What QR Studio does: vCard, URL and map QR codes, dynamic redirects, scan tracking and team access.",
};

const features = [
  {
    title: "vCard codes",
    body: "Share a contact card. Scanning adds the name, company, phone, email, website and address to the phone's address book.",
  },
  {
    title: "URL codes",
    body: "Send people to a website, a menu, a booking page or a form.",
  },
  {
    title: "Map codes",
    body: "Point people to a location in their map app.",
  },
  {
    title: "Dynamic redirects",
    body: "Codes go through a short link, so you can change the destination after the code is printed.",
  },
  {
    title: "Scan tracking",
    body: "Every scan is recorded so you can see which codes are used.",
  },
  {
    title: "Stores and team access",
    body: "Group codes by store. Admins, store managers and staff each see only what their role allows.",
  },
  {
    title: "Pay as you go",
    body: "Buy credits. Each new code uses one credit.",
  },
];

export default function FeaturesPage() {
  return (
    <VStack gap={5}>
      <VStack gap={2}>
        <Heading level={1}>Features</Heading>
        <Text>Everything QR Studio can do, in plain terms.</Text>
      </VStack>

      <VStack gap={3}>
        {features.map((feature) => (
          <Card key={feature.title} padding={4} elevation="low">
            <VStack gap={1}>
              <Heading level={3}>{feature.title}</Heading>
              <Text>{feature.body}</Text>
            </VStack>
          </Card>
        ))}
      </VStack>

      <Button label="Sign in to start" variant="primary" href="/login" />
    </VStack>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getCurrentUser } from "@/lib/session";
import { CREDIT_PACKS } from "@/lib/billing/config";
import { environment } from "@/lib/environment";

export const instant = false;

export const metadata: Metadata = {
  title: "QR Studio",
  description: "Create vCard, URL and map QR codes that you can change after printing. Every scan is recorded.",
};

const points = [
  {
    title: "Change the target anytime",
    body: "Dynamic codes go through a short link. Update where a printed code points without reprinting it.",
  },
  {
    title: "See every scan",
    body: "Each scan is recorded, so you know which codes are working.",
  },
  {
    title: "Built for teams",
    body: "Admins, store managers and staff each get the access they need, per store.",
  },
];

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const pricePerCreditInRupees = environment().CREDIT_PRICE_PAISE / 100;

  return (
    <VStack gap={6}>
      <VStack gap={3}>
        <Heading level={1}>QR codes you can change after you print them</Heading>
        <Text>
          QR Studio makes vCard, URL and map QR codes. Dynamic codes redirect through a short link, so you can update
          where they point without reprinting. Every scan is recorded.
        </Text>
        <HStack gap={2}>
          <Button label="Sign in with Google" variant="primary" href="/login" />
          <Button label="See features" variant="secondary" href="/features" />
        </HStack>
      </VStack>

      <VStack gap={3}>
        {points.map((point) => (
          <Card key={point.title} padding={4} elevation="low">
            <VStack gap={1}>
              <Heading level={3}>{point.title}</Heading>
              <Text>{point.body}</Text>
            </VStack>
          </Card>
        ))}
      </VStack>

      <VStack gap={2}>
        <Heading level={2}>Simple pricing</Heading>
        <Text>
          Each QR code you create uses 1 credit. Credits come in packs of {CREDIT_PACKS.join(", ")}, at ₹
          {pricePerCreditInRupees} per credit.
        </Text>
      </VStack>
    </VStack>
  );
}

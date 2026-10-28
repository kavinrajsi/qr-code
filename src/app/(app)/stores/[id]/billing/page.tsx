import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { Badge } from "@astryxdesign/core/Badge";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getDatabase, schema } from "@/database";
import { isPermitted } from "@/lib/auth/permissions";
import { getStoreAccess, requireUser } from "@/lib/session";
import { creditBalance } from "@/lib/billing/credits";
import { CREDIT_PACKS } from "@/lib/billing/config";
import { environment } from "@/lib/environment";
import { BuyCredits } from "@/components/buy-credits";

type RouteParameters = { params: Promise<{ id: string }> };

function formatRupees(amountInPaise: number): string {
  return `₹${(amountInPaise / 100).toLocaleString("en-IN")}`;
}

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function BillingPage({ params }: RouteParameters) {
  const { id } = await params;
  const user = await requireUser();
  const access = await getStoreAccess(user, id);
  if (!isPermitted(user.role, access, "billing.view")) notFound();

  const database = getDatabase();
  const [storeRecord] = await database
    .select({ name: schema.stores.name })
    .from(schema.stores)
    .where(eq(schema.stores.id, id))
    .limit(1);
  if (!storeRecord) notFound();

  const [currentBalance, invoiceRecords, paymentRecords] = await Promise.all([
    creditBalance(id),
    database
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.storeId, id))
      .orderBy(desc(schema.invoices.createdAt)),
    database.select({ id: schema.payments.id }).from(schema.payments).where(eq(schema.payments.storeId, id)),
  ]);
  const canPay = isPermitted(user.role, access, "billing.pay");
  const pricePerCreditInPaise = environment().CREDIT_PRICE_PAISE;

  return (
    <VStack gap={5}>
      <Heading level={2}>Billing · {storeRecord.name}</Heading>
      <Card padding={4}>
        <VStack gap={2}>
          <Text>Balance</Text>
          <Heading level={1}>{currentBalance} credits</Heading>
          <Text>Each QR code created uses 1 credit. Price: {formatRupees(pricePerCreditInPaise)} per credit.</Text>
        </VStack>
      </Card>

      {canPay && (
        <Card padding={4}>
          <VStack gap={3}>
            <Heading level={3}>Buy credits</Heading>
            <HStack gap={2}>
              {CREDIT_PACKS.map((creditPack) => (
                <BuyCredits
                  key={creditPack}
                  storeId={id}
                  credits={creditPack}
                  label={`${creditPack} credits · ${formatRupees(creditPack * pricePerCreditInPaise)}`}
                />
              ))}
            </HStack>
          </VStack>
        </Card>
      )}

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={3}>Invoices</Heading>
          {invoiceRecords.length === 0 && (
            <Text>No paid invoices yet. {paymentRecords.length} order(s) created.</Text>
          )}
          {invoiceRecords.map((invoice) => (
            <HStack key={invoice.id} gap={2} hAlign="between" vAlign="center">
              <VStack gap={0}>
                <Text>{invoice.number}</Text>
                <Text>
                  {invoice.credits} credits · {invoice.createdAt.toLocaleDateString("en-IN")}
                </Text>
              </VStack>
              <HStack gap={2} vAlign="center">
                <Badge label={formatRupees(invoice.amountPaise)} variant="success" />
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}

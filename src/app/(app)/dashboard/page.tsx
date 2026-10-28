import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { requireUser } from "@/lib/session";
import { visibleStores } from "@/lib/store-queries";
import { creditBalance } from "@/lib/billing/credits";

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function DashboardPage() {
  const user = await requireUser();
  const stores = await visibleStores(user);
  const canCreateStore = user.role === "admin" || user.role === "super_admin";
  const creditBalances = await Promise.all(stores.map((store) => creditBalance(store.id)));

  return (
    <VStack gap={4}>
      <HStack gap={2} hAlign="between" vAlign="center">
        <Heading level={2}>Your stores</Heading>
        {canCreateStore && <Button label="New store" variant="primary" href="/stores/new" />}
      </HStack>

      {stores.length === 0 && (
        <Card padding={4}>
          <Text>You have no store access yet. Ask an admin to add your Google email to a store.</Text>
        </Card>
      )}

      {stores.map((store, storeIndex) => (
        <Card key={store.id} padding={4} elevation="low">
          <HStack gap={2} hAlign="between" vAlign="center">
            <VStack gap={1}>
              <Heading level={3}>{store.name}</Heading>
              <HStack gap={2}>
                <Badge
                  label={`${creditBalances[storeIndex]} credits`}
                  variant={creditBalances[storeIndex] > 0 ? "success" : "warning"}
                />
              </HStack>
            </VStack>
            <Button label="Open" variant="secondary" href={`/stores/${store.id}`} />
          </HStack>
        </Card>
      ))}
    </VStack>
  );
}

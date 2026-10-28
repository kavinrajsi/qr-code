import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getDatabase, schema } from "@/database";
import { isPermitted, canTargetUser } from "@/lib/auth/permissions";
import { requireUser } from "@/lib/session";
import { addPlatformAdmin, grantCredits, setUserSuspended } from "@/app/actions/admin";
import { Field } from "@/components/field";

// Super admin only. Emails are never stored or shown; users appear by name and role.

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function AdminPage() {
  const user = await requireUser();
  if (!isPermitted(user.role, null, "admin.manage")) notFound();

  const userRecords = await getDatabase()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      role: schema.users.role,
      isSuperAdmin: schema.users.isSuperAdmin,
      suspended: schema.users.suspended,
    })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .limit(200);

  return (
    <VStack gap={5}>
      <Heading level={2}>Platform admins</Heading>

      <Card padding={4} maxWidth={520}>
        <form action={addPlatformAdmin}>
          <VStack gap={3}>
            <Heading level={3}>Add admin</Heading>
            <Field label="Google email" name="email" type="email" required />
            <Button label="Make admin" variant="primary" type="submit" />
          </VStack>
        </form>
      </Card>

      <Card padding={4} maxWidth={520}>
        <form action={grantCredits}>
          <VStack gap={3}>
            <Heading level={3}>Grant credits (testing and support, no payment)</Heading>
            <Field label="Store ID" name="storeId" required hint="Copy it from the store page URL." />
            <Field label="Credits" name="credits" type="number" required min={1} max={10000} />
            <Button label="Grant credits" variant="secondary" type="submit" />
          </VStack>
        </form>
      </Card>

      <Card padding={4}>
        <VStack gap={3}>
          {userRecords.map((userRecord) => (
            <HStack key={userRecord.id} gap={2} hAlign="between" vAlign="center">
              <VStack gap={0}>
                <Text>{userRecord.isSuperAdmin ? "Platform owner" : userRecord.name ?? "Unnamed user"}</Text>
                <HStack gap={2}>
                  <Badge label={userRecord.role} variant={userRecord.role === "user" ? "neutral" : "info"} />
                  {userRecord.suspended && <Badge label="suspended" variant="error" />}
                </HStack>
              </VStack>
              {canTargetUser({ isSuperAdmin: userRecord.isSuperAdmin }) && (
                <form action={setUserSuspended}>
                  <input type="hidden" name="userId" value={userRecord.id} />
                  <input type="hidden" name="suspended" value={userRecord.suspended ? "false" : "true"} />
                  <Button
                    label={userRecord.suspended ? "Restore" : "Suspend"}
                    variant={userRecord.suspended ? "secondary" : "destructive"}
                    size="sm"
                    type="submit"
                  />
                </form>
              )}
            </HStack>
          ))}
        </VStack>
      </Card>
    </VStack>
  );
}

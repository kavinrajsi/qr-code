import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { getDatabase, schema } from "@/database";
import { isPermitted } from "@/lib/auth/permissions";
import { getStoreAccess, requireUser } from "@/lib/session";
import { codesForStore, membersOfStore } from "@/lib/store-queries";
import { creditBalance } from "@/lib/billing/credits";
import { changeMemberRole, inviteMember, removeMember } from "@/app/actions/stores";
import { Field, SelectField } from "@/components/field";

type RouteParameters = { params: Promise<{ id: string }> };

// Per-user data: render on request, not at build time.
export const instant = false;

export default async function StorePage({ params }: RouteParameters) {
  const { id } = await params;
  const user = await requireUser();
  const access = await getStoreAccess(user, id);
  if (!isPermitted(user.role, access, "store.view")) notFound();

  const [storeRecord] = await getDatabase()
    .select()
    .from(schema.stores)
    .where(eq(schema.stores.id, id))
    .limit(1);
  if (!storeRecord) notFound();

  const [codeSummaries, teamMembers, currentBalance] = await Promise.all([
    codesForStore(id),
    membersOfStore(id),
    creditBalance(id),
  ]);
  const canCreate = isPermitted(user.role, access, "code.create");
  const canManage = isPermitted(user.role, access, "members.manage");
  const canBill = isPermitted(user.role, access, "billing.view");

  return (
    <VStack gap={5}>
      <HStack gap={2} hAlign="between" vAlign="center">
        <VStack gap={1}>
          <Heading level={2}>{storeRecord.name}</Heading>
          <Badge
            label={`${currentBalance} credits left`}
            variant={currentBalance > 0 ? "success" : "warning"}
          />
        </VStack>
        <HStack gap={2}>
          {canBill && <Button label="Billing" variant="secondary" href={`/stores/${id}/billing`} />}
          {canCreate && <Button label="New QR code" variant="primary" href={`/codes/new?storeId=${id}`} />}
        </HStack>
      </HStack>

      <Card padding={4}>
        <VStack gap={3}>
          <Heading level={3}>QR codes</Heading>
          {codeSummaries.length === 0 && <Text>No codes yet.</Text>}
          <div className="code-list" id="code-list">
            {codeSummaries.map((codeSummary) => (
              <div key={codeSummary.id} className="code-list__item">
                <div>
                  <Link className="code-list__link" href={`/codes/${codeSummary.id}`}>
                    {codeSummary.title}
                  </Link>
                  <Text>
                    {codeSummary.type} · {codeSummary.isDynamic ? "dynamic" : "static"} · {codeSummary.scans} scans
                    {codeSummary.status === "disabled" ? " · disabled" : ""}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </VStack>
      </Card>

      {canManage && (
        <Card padding={4}>
          <VStack gap={4}>
            <Heading level={3}>Team</Heading>
            <Text>Members see the store once they sign in with the invited Google account.</Text>
            <div className="team-list" id="team-list">
              {teamMembers.map((member) => (
                <div key={member.id} className="team-list__member">
                  <Text>
                    {member.name ?? "Unnamed member"} · {member.role}
                    {member.linked ? "" : " · invited, not signed in yet"}
                  </Text>
                  <div className="team-list__actions">
                    <form action={changeMemberRole} className="team-list__form">
                      <input type="hidden" name="storeId" value={id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <input
                        type="hidden"
                        name="role"
                        value={member.role === "manager" ? "employee" : "manager"}
                      />
                      <Button
                        label={member.role === "manager" ? "Make employee" : "Make manager"}
                        variant="ghost"
                        size="sm"
                        type="submit"
                      />
                    </form>
                    <form action={removeMember} className="team-list__form">
                      <input type="hidden" name="storeId" value={id} />
                      <input type="hidden" name="memberId" value={member.id} />
                      <Button label="Remove" variant="destructive" size="sm" type="submit" />
                    </form>
                  </div>
                </div>
              ))}
            </div>
            <form action={inviteMember} id="invite-member-form">
              <input type="hidden" name="storeId" value={id} />
              <VStack gap={3}>
                <Field label="Name" name="displayName" maxLength={80} hint="Shown until they sign in." />
                <Field label="Google email to invite" name="email" type="email" required />
                <SelectField
                  label="Role"
                  name="role"
                  defaultValue="employee"
                  options={[
                    { value: "employee", label: "Employee: create and view codes" },
                    { value: "manager", label: "Manager: also pay, manage team, edit codes" },
                  ]}
                />
                <Button label="Invite" variant="primary" type="submit" />
              </VStack>
            </form>
          </VStack>
        </Card>
      )}
    </VStack>
  );
}

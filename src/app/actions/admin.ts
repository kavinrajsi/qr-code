"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import * as zod from "zod";
import { getDatabase, schema } from "@/database";
import { requireUser } from "@/lib/session";
import { isPermitted, canTargetUser } from "@/lib/auth/permissions";
import { hashEmail } from "@/lib/hash";
import { recordAuditEntry } from "@/lib/audit";

// Super admin only. Every action refuses the protected super admin row.

export async function addPlatformAdmin(formData: FormData) {
  const actingUser = await requireUser();
  if (!isPermitted(actingUser.role, null, "admin.manage")) throw new Error("Not allowed");

  const emailAddress = zod.email().parse(formData.get("email"));
  const emailHash = hashEmail(emailAddress);

  // Upsert as admin. If the email is the super admin, the existing row wins and nothing changes.
  const [existingUser] = await getDatabase()
    .select({ id: schema.users.id, isSuperAdmin: schema.users.isSuperAdmin })
    .from(schema.users)
    .where(eq(schema.users.emailHash, emailHash))
    .limit(1);

  if (existingUser) {
    if (!canTargetUser(existingUser)) throw new Error("Not allowed");
    await getDatabase().update(schema.users).set({ role: "admin" }).where(eq(schema.users.id, existingUser.id));
    await recordAuditEntry(actingUser.id, "admin.promote", existingUser.id);
  } else {
    const [createdUser] = await getDatabase()
      .insert(schema.users)
      .values({ emailHash, role: "admin" })
      .returning({ id: schema.users.id });
    await recordAuditEntry(actingUser.id, "admin.create", createdUser.id);
  }
  revalidatePath("/admin");
}

export async function setUserSuspended(formData: FormData) {
  const actingUser = await requireUser();
  if (!isPermitted(actingUser.role, null, "admin.manage")) throw new Error("Not allowed");

  const userIdentifier = zod.uuid().parse(formData.get("userId"));
  const suspended = formData.get("suspended") === "true";

  const [targetUser] = await getDatabase()
    .select({ isSuperAdmin: schema.users.isSuperAdmin })
    .from(schema.users)
    .where(eq(schema.users.id, userIdentifier))
    .limit(1);
  if (!targetUser || !canTargetUser(targetUser)) throw new Error("Not allowed");

  await getDatabase().update(schema.users).set({ suspended }).where(eq(schema.users.id, userIdentifier));
  await recordAuditEntry(actingUser.id, suspended ? "user.suspend" : "user.unsuspend", userIdentifier);
  revalidatePath("/admin");
}

// Super admin only. Adds credits to a store without payment, for testing or support.
// Recorded in the ledger as an adjustment with the acting user's identifier.
export async function grantCredits(formData: FormData) {
  const actingUser = await requireUser();
  if (!isPermitted(actingUser.role, null, "admin.manage")) throw new Error("Not allowed");

  const storeIdentifier = zod.uuid().parse(formData.get("storeId"));
  const creditCount = zod.coerce.number().int().min(1).max(10000).parse(formData.get("credits"));

  await getDatabase().insert(schema.creditLedger).values({
    storeId: storeIdentifier,
    delta: creditCount,
    reason: "adjustment",
    reference: actingUser.id,
  });
  await recordAuditEntry(actingUser.id, "credits.grant", storeIdentifier);
  revalidatePath("/admin");
  revalidatePath(`/stores/${storeIdentifier}`);
}

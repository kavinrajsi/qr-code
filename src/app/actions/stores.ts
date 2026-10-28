"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import * as zod from "zod";
import { getDatabase, schema } from "@/database";
import { requireUser, assertStoreAction } from "@/lib/session";
import { recordAuditEntry } from "@/lib/audit";
import { hashEmail } from "@/lib/hash";

const storeDetailsSchema = zod.object({
  name: zod.string().trim().min(2).max(80),
  gstin: zod
    .string()
    .trim()
    .toUpperCase()
    .regex(/^$|^[0-9A-Z]{15}$/, "GSTIN must be 15 characters")
    .optional()
    .default(""),
});

const memberInviteSchema = zod.object({
  email: zod.email().max(254),
  role: zod.enum(["manager", "employee"]),
  displayName: zod.string().trim().max(80).optional().default(""),
});

export async function createStore(formData: FormData) {
  const user = await requireUser();
  if (!(user.role === "admin" || user.role === "super_admin")) throw new Error("Not allowed");

  const storeDetails = storeDetailsSchema.parse({
    name: formData.get("name"),
    gstin: formData.get("gstin") ?? "",
  });
  const [createdStore] = await getDatabase()
    .insert(schema.stores)
    .values({ adminId: user.id, name: storeDetails.name, gstin: storeDetails.gstin || null })
    .returning({ id: schema.stores.id });

  await recordAuditEntry(user.id, "store.create", createdStore.id);
  revalidatePath("/stores");
  redirect(`/stores/${createdStore.id}`);
}

export async function inviteMember(formData: FormData) {
  const user = await requireUser();
  const storeIdentifier = String(formData.get("storeId"));
  await assertStoreAction(user, storeIdentifier, "members.manage");

  const invite = memberInviteSchema.parse({
    email: formData.get("email"),
    role: formData.get("role"),
    displayName: formData.get("displayName") ?? "",
  });
  const emailHash = hashEmail(invite.email);

  // If the person already has an account, link it now; otherwise sign-in links it later.
  const [existingUser] = await getDatabase()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.emailHash, emailHash))
    .limit(1);

  await getDatabase()
    .insert(schema.storeMembers)
    .values({
      storeId: storeIdentifier,
      emailHash,
      role: invite.role,
      displayName: invite.displayName || null,
      userId: existingUser?.id ?? null,
    })
    .onConflictDoUpdate({
      target: [schema.storeMembers.storeId, schema.storeMembers.emailHash],
      set: { role: invite.role, displayName: invite.displayName || null },
    });

  await recordAuditEntry(user.id, "member.invite", storeIdentifier);
  revalidatePath(`/stores/${storeIdentifier}`);
}

export async function changeMemberRole(formData: FormData) {
  const user = await requireUser();
  const storeIdentifier = String(formData.get("storeId"));
  await assertStoreAction(user, storeIdentifier, "members.manage");

  const nextRole = zod.enum(["manager", "employee"]).parse(formData.get("role"));
  await getDatabase()
    .update(schema.storeMembers)
    .set({ role: nextRole })
    .where(
      and(
        eq(schema.storeMembers.id, String(formData.get("memberId"))),
        eq(schema.storeMembers.storeId, storeIdentifier),
      ),
    );

  await recordAuditEntry(user.id, "member.role", storeIdentifier);
  revalidatePath(`/stores/${storeIdentifier}`);
}

export async function removeMember(formData: FormData) {
  const user = await requireUser();
  const storeIdentifier = String(formData.get("storeId"));
  await assertStoreAction(user, storeIdentifier, "members.manage");

  await getDatabase()
    .delete(schema.storeMembers)
    .where(
      and(
        eq(schema.storeMembers.id, String(formData.get("memberId"))),
        eq(schema.storeMembers.storeId, storeIdentifier),
      ),
    );

  await recordAuditEntry(user.id, "member.remove", storeIdentifier);
  revalidatePath(`/stores/${storeIdentifier}`);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import * as zod from "zod";
import { getDatabase, schema } from "@/database";
import { requireUser, assertStoreAction } from "@/lib/session";
import { recordAuditEntry } from "@/lib/audit";
import { CREDITS_PER_CODE } from "@/lib/billing/config";
import {
  encodedContent,
  mapPayloadSchema,
  newShortCode,
  urlPayloadSchema,
  vcardPayloadSchema,
  type QrType,
} from "@/lib/qr/payload";
import { environment } from "@/lib/environment";

const codeNameSchema = zod.string().trim().min(1, "Give the code a name").max(80);

function payloadFromForm(type: QrType, formData: FormData): unknown {
  const readField = (fieldName: string) => (formData.get(fieldName) ?? "").toString();
  switch (type) {
    case "url":
      return urlPayloadSchema.parse({ url: readField("url") });
    case "map":
      return mapPayloadSchema.parse({
        latitude: readField("latitude"),
        longitude: readField("longitude"),
        label: readField("label"),
      });
    case "vcard":
      return vcardPayloadSchema.parse({
        firstName: readField("firstName"),
        lastName: readField("lastName"),
        organization: readField("organization"),
        title: readField("jobTitle"),
        phone: readField("phone"),
        email: readField("email"),
        website: readField("website"),
        address: readField("address"),
      });
  }
}

export async function createCode(formData: FormData) {
  const user = await requireUser();
  const storeIdentifier = String(formData.get("storeId"));
  await assertStoreAction(user, storeIdentifier, "code.create");

  const type = zod.enum(["url", "map", "vcard"]).parse(formData.get("type"));
  const isDynamic = formData.get("isDynamic") === "on";
  const codeName = codeNameSchema.parse(formData.get("title"));
  const payload = payloadFromForm(type, formData);
  // Validate the encoded content up front (size, format) before spending a credit.
  encodedContent({ type, payload, isDynamic, appUrl: environment().APP_URL, shortCode: "validate" });

  const codeIdentifier = await getDatabase().transaction(async (transaction) => {
    // Lock the store row so two concurrent creates cannot both spend the last credit.
    await transaction.execute(sql`select id from stores where id = ${storeIdentifier} for update`);

    const [balanceRecord] = await transaction
      .select({ total: sql<number>`coalesce(sum(${schema.creditLedger.delta}), 0)::int` })
      .from(schema.creditLedger)
      .where(eq(schema.creditLedger.storeId, storeIdentifier));
    if ((balanceRecord?.total ?? 0) < CREDITS_PER_CODE) {
      throw new Error("No credits left for this store. Buy credits to create codes.");
    }

    const [createdCode] = await transaction
      .insert(schema.qrCodes)
      .values({
        storeId: storeIdentifier,
        createdBy: user.id,
        type,
        title: codeName,
        payload: payload as Record<string, unknown>,
        isDynamic,
        shortCode: isDynamic ? newShortCode() : null,
      })
      .returning({ id: schema.qrCodes.id });

    await transaction.insert(schema.creditLedger).values({
      storeId: storeIdentifier,
      delta: -CREDITS_PER_CODE,
      reason: "qr_create",
      reference: createdCode.id,
    });
    return createdCode.id;
  });

  await recordAuditEntry(user.id, "code.create", codeIdentifier);
  revalidatePath(`/stores/${storeIdentifier}`);
  redirect(`/codes/${codeIdentifier}`);
}

// Dynamic codes: payload can change and the printed QR keeps working.
// Static codes: content is baked into the symbol, so only the name can change.
export async function updateCode(formData: FormData) {
  const user = await requireUser();
  const codeIdentifier = String(formData.get("codeId"));
  const [codeRecord] = await getDatabase()
    .select({
      id: schema.qrCodes.id,
      storeId: schema.qrCodes.storeId,
      type: schema.qrCodes.type,
      isDynamic: schema.qrCodes.isDynamic,
    })
    .from(schema.qrCodes)
    .where(eq(schema.qrCodes.id, codeIdentifier))
    .limit(1);
  if (!codeRecord) throw new Error("Not found");
  await assertStoreAction(user, codeRecord.storeId, "code.edit");

  const codeName = codeNameSchema.parse(formData.get("title"));
  const changes: { title: string; payload?: Record<string, unknown>; updatedAt: Date } = {
    title: codeName,
    updatedAt: new Date(),
  };
  if (codeRecord.isDynamic) {
    const type = codeRecord.type as QrType;
    changes.payload = payloadFromForm(type, formData) as Record<string, unknown>;
  }

  await getDatabase().update(schema.qrCodes).set(changes).where(eq(schema.qrCodes.id, codeIdentifier));
  await recordAuditEntry(user.id, "code.update", codeIdentifier);
  revalidatePath(`/codes/${codeIdentifier}`);
}

export async function setCodeStatus(formData: FormData) {
  const user = await requireUser();
  const codeIdentifier = String(formData.get("codeId"));
  const nextStatus = zod.enum(["active", "disabled"]).parse(formData.get("status"));
  const [codeRecord] = await getDatabase()
    .select({ storeId: schema.qrCodes.storeId })
    .from(schema.qrCodes)
    .where(eq(schema.qrCodes.id, codeIdentifier))
    .limit(1);
  if (!codeRecord) throw new Error("Not found");
  await assertStoreAction(user, codeRecord.storeId, "code.disable");

  await getDatabase()
    .update(schema.qrCodes)
    .set({ status: nextStatus, updatedAt: new Date() })
    .where(and(eq(schema.qrCodes.id, codeIdentifier), eq(schema.qrCodes.storeId, codeRecord.storeId)));
  await recordAuditEntry(user.id, `code.${nextStatus}`, codeIdentifier);
  revalidatePath(`/codes/${codeIdentifier}`);
}

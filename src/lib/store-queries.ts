import "server-only";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { getDatabase, schema } from "@/database";
import type { CurrentUser } from "@/lib/session";

// Stores the user can see: their own (admin) or those they are a member of.
// The super admin sees all stores.
export async function visibleStores(user: CurrentUser) {
  const database = getDatabase();
  if (user.role === "super_admin") {
    return database.select().from(schema.stores).orderBy(desc(schema.stores.createdAt));
  }
  const memberStoreIdentifiers = database
    .select({ id: schema.storeMembers.storeId })
    .from(schema.storeMembers)
    .where(eq(schema.storeMembers.userId, user.id));

  return database
    .select()
    .from(schema.stores)
    .where(or(eq(schema.stores.adminId, user.id), inArray(schema.stores.id, memberStoreIdentifiers)))
    .orderBy(desc(schema.stores.createdAt));
}

export async function codesForStore(storeId: string) {
  const database = getDatabase();
  return database
    .select({
      id: schema.qrCodes.id,
      title: schema.qrCodes.title,
      type: schema.qrCodes.type,
      isDynamic: schema.qrCodes.isDynamic,
      status: schema.qrCodes.status,
      createdAt: schema.qrCodes.createdAt,
      scans: sql<number>`(select count(*)::int from ${schema.qrScans} scan where scan.qr_code_id = ${schema.qrCodes.id})`,
    })
    .from(schema.qrCodes)
    .where(eq(schema.qrCodes.storeId, storeId))
    .orderBy(desc(schema.qrCodes.createdAt));
}

export async function codeWithStore(codeId: string) {
  const [codeRecord] = await getDatabase()
    .select({ code: schema.qrCodes, storeName: schema.stores.name, storeId: schema.stores.id })
    .from(schema.qrCodes)
    .innerJoin(schema.stores, eq(schema.stores.id, schema.qrCodes.storeId))
    .where(eq(schema.qrCodes.id, codeId))
    .limit(1);
  return codeRecord ?? null;
}

export async function membersOfStore(storeId: string) {
  return getDatabase()
    .select({
      id: schema.storeMembers.id,
      role: schema.storeMembers.role,
      // Linked members show their Google name; pending invites show the typed name.
      name: sql<string | null>`coalesce(${schema.users.name}, ${schema.storeMembers.displayName})`,
      linked: sql<boolean>`${schema.storeMembers.userId} is not null`,
    })
    .from(schema.storeMembers)
    .leftJoin(schema.users, eq(schema.users.id, schema.storeMembers.userId))
    .where(eq(schema.storeMembers.storeId, storeId))
    .orderBy(schema.storeMembers.createdAt);
}

export async function scansForCode(codeId: string, maximumRows = 500) {
  return getDatabase()
    .select({
      scannedAt: schema.qrScans.scannedAt,
      device: schema.qrScans.device,
      country: schema.qrScans.country,
    })
    .from(schema.qrScans)
    .where(and(eq(schema.qrScans.qrCodeId, codeId)))
    .orderBy(desc(schema.qrScans.scannedAt))
    .limit(maximumRows);
}

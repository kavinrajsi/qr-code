import "server-only";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { readSession } from "@/authentication";
import { getDatabase, schema } from "@/database";
import { isPermitted, effectiveAccess, type Action, type PlatformRole, type StoreAccess } from "@/lib/auth/permissions";

export type CurrentUser = {
  id: string;
  name: string | null;
  role: PlatformRole;
  isSuperAdmin: boolean;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await readSession();
  const userIdentifier = session?.user?.id;
  if (!userIdentifier) return null;

  const [userRecord] = await getDatabase()
    .select({
      id: schema.users.id,
      name: schema.users.name,
      role: schema.users.role,
      isSuperAdmin: schema.users.isSuperAdmin,
      suspended: schema.users.suspended,
    })
    .from(schema.users)
    .where(eq(schema.users.id, userIdentifier))
    .limit(1);

  if (!userRecord || userRecord.suspended) return null;
  return {
    id: userRecord.id,
    name: userRecord.name,
    role: userRecord.role as PlatformRole,
    isSuperAdmin: userRecord.isSuperAdmin,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

// Resolves the caller's effective access to a store. Returns null when the store
// is not theirs, so callers can 404 without revealing that the store exists.
export async function getStoreAccess(user: CurrentUser, storeId: string): Promise<StoreAccess> {
  const database = getDatabase();
  const [storeRecord] = await database
    .select({ adminId: schema.stores.adminId })
    .from(schema.stores)
    .where(eq(schema.stores.id, storeId))
    .limit(1);
  if (!storeRecord) return null;

  const [membershipRecord] = await database
    .select({ role: schema.storeMembers.role })
    .from(schema.storeMembers)
    .where(and(eq(schema.storeMembers.storeId, storeId), eq(schema.storeMembers.userId, user.id)))
    .limit(1);

  return effectiveAccess(
    user.role,
    storeRecord.adminId === user.id,
    (membershipRecord?.role as "manager" | "employee" | undefined) ?? null,
  );
}

export async function assertStoreAction(user: CurrentUser, storeId: string, action: Action) {
  const access = await getStoreAccess(user, storeId);
  if (!isPermitted(user.role, access, action)) {
    throw new Error("Not allowed");
  }
  return access;
}

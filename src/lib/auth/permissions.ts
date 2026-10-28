// Pure policy functions. No I/O, so the role matrix is unit-tested directly.

export type PlatformRole = "user" | "admin" | "super_admin";
export type StoreRole = "manager" | "employee";
// Effective access to one store.
export type StoreAccess = "admin" | StoreRole | null;

export type Action =
  | "store.create"
  | "store.view"
  | "members.manage"
  | "billing.view"
  | "billing.pay"
  | "code.create"
  | "code.view"
  | "code.edit"
  | "code.disable"
  | "admin.manage";

// Super admin sees everything. An admin is "admin" on stores they own (admin_id).
// Otherwise access comes from store membership.
export function effectiveAccess(
  platformRole: PlatformRole,
  ownsStore: boolean,
  membership: StoreRole | null,
): StoreAccess {
  if (platformRole === "super_admin") return "admin";
  if (platformRole === "admin" && ownsStore) return "admin";
  return membership;
}

export function isPermitted(platformRole: PlatformRole, access: StoreAccess, action: Action): boolean {
  const isAdmin = platformRole === "admin" || platformRole === "super_admin";
  const isManager = access === "admin" || access === "manager";
  const hasAccess = access !== null;

  switch (action) {
    case "store.create":
      return isAdmin;
    case "store.view":
    case "code.view":
    case "code.create":
      return hasAccess;
    case "members.manage":
    case "billing.view":
    case "billing.pay":
    case "code.edit":
    case "code.disable":
      return isManager;
    case "admin.manage":
      // Only the super admin manages platform admins. Target checks live in the action.
      return platformRole === "super_admin";
  }
}

// The super admin row can never be the target of a manage action.
export function canTargetUser(target: { isSuperAdmin: boolean }): boolean {
  return !target.isSuperAdmin;
}

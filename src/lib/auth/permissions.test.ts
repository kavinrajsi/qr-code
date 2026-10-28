import { describe, expect, it } from "vitest";
import { isPermitted, canTargetUser, effectiveAccess } from "./permissions";

describe("effectiveAccess", () => {
  it("gives the super admin admin access to every store", () => {
    expect(effectiveAccess("super_admin", false, null)).toBe("admin");
  });
  it("gives an admin admin access only to stores they own", () => {
    expect(effectiveAccess("admin", true, null)).toBe("admin");
    expect(effectiveAccess("admin", false, null)).toBeNull();
  });
  it("uses membership for ordinary users", () => {
    expect(effectiveAccess("user", false, "employee")).toBe("employee");
    expect(effectiveAccess("user", false, null)).toBeNull();
  });
});

describe("isPermitted", () => {
  it("lets employees view and create codes but not touch billing or members", () => {
    expect(isPermitted("user", "employee", "code.create")).toBe(true);
    expect(isPermitted("user", "employee", "code.view")).toBe(true);
    expect(isPermitted("user", "employee", "code.edit")).toBe(false);
    expect(isPermitted("user", "employee", "billing.view")).toBe(false);
    expect(isPermitted("user", "employee", "billing.pay")).toBe(false);
    expect(isPermitted("user", "employee", "members.manage")).toBe(false);
  });

  it("lets store managers pay and manage employees for their store", () => {
    expect(isPermitted("user", "manager", "billing.pay")).toBe(true);
    expect(isPermitted("user", "manager", "members.manage")).toBe(true);
    expect(isPermitted("user", "manager", "code.edit")).toBe(true);
  });

  it("denies everything when there is no store access", () => {
    for (const action of ["store.view", "code.view", "code.create", "billing.view"] as const) {
      expect(isPermitted("user", null, action)).toBe(false);
    }
  });

  it("only admins can create stores; only the super admin manages admins", () => {
    expect(isPermitted("user", null, "store.create")).toBe(false);
    expect(isPermitted("admin", null, "store.create")).toBe(true);
    expect(isPermitted("admin", null, "admin.manage")).toBe(false);
    expect(isPermitted("super_admin", null, "admin.manage")).toBe(true);
  });

  it("never allows targeting the super admin row", () => {
    expect(canTargetUser({ isSuperAdmin: true })).toBe(false);
    expect(canTargetUser({ isSuperAdmin: false })).toBe(true);
  });
});

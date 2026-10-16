import { describe, expect, it } from "vitest";
import { canManageUser, isAdmin, roleLabel } from "./roles";
import type { UserRole } from "./types";

const user = (id: string, role: UserRole, is_super_admin = false) => ({ id, role, is_super_admin });

describe("isAdmin", () => {
  it("is true for admins and the super admin", () => {
    expect(isAdmin(user("a", "admin"))).toBe(true);
    expect(isAdmin(user("s", "member", true))).toBe(true);
    expect(isAdmin(user("m", "member"))).toBe(false);
  });
});

describe("canManageUser", () => {
  const superAdmin = user("s", "admin", true);
  const admin = user("a", "admin");
  const member = user("m", "member");

  it("lets admins manage members only", () => {
    expect(canManageUser(admin, member)).toBe(true);
    expect(canManageUser(admin, user("a2", "admin"))).toBe(false);
    expect(canManageUser(member, user("m2", "member"))).toBe(false);
  });

  it("lets the super admin manage admins", () => {
    expect(canManageUser(superAdmin, admin)).toBe(true);
    expect(canManageUser(superAdmin, member)).toBe(true);
  });

  it("never allows changing yourself or a super admin", () => {
    expect(canManageUser(admin, admin)).toBe(false);
    expect(canManageUser(superAdmin, superAdmin)).toBe(false);
    expect(canManageUser(superAdmin, user("s2", "admin", true))).toBe(false);
  });
});

describe("roleLabel", () => {
  it("labels the super admin", () => {
    expect(roleLabel(user("s", "admin", true))).toBe("super admin");
    expect(roleLabel(user("a", "admin"))).toBe("admin");
  });
});

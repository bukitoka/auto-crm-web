import { describe, expect, it } from "vitest";
import {
  canManageAdmins,
  canManageWorkspace,
  canViewTeam,
  canWriteCrm,
  isSuperAdmin,
  roleLabel,
} from "./roles";

const admin = { is_super_admin: false };
const boss = { is_super_admin: true };

describe("role helpers", () => {
  it("lets only admins write CRM data", () => {
    expect(canWriteCrm(admin)).toBe(true);
    expect(canWriteCrm(boss)).toBe(false);
  });

  it.each([
    ["isSuperAdmin", isSuperAdmin],
    ["canManageAdmins", canManageAdmins],
    ["canManageWorkspace", canManageWorkspace],
    ["canViewTeam", canViewTeam],
  ])("%s is reserved for the super admin", (_name, check) => {
    expect(check(boss)).toBe(true);
    expect(check(admin)).toBe(false);
  });
});

describe("roleLabel", () => {
  it("labels the super admin and admins", () => {
    expect(roleLabel(boss)).toBe("super admin");
    expect(roleLabel(admin)).toBe("admin");
  });
});

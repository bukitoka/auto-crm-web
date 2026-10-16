import type { User } from "./types";

type HasRole = Pick<User, "is_super_admin">;

/** The boss: reads everything, manages admins, pipeline and automations. The API enforces the same rules. */
export function isSuperAdmin(user: HasRole) {
  return user.is_super_admin;
}

/** Admins own and edit their CRM records; the super admin only views them. */
export function canWriteCrm(user: HasRole) {
  return !user.is_super_admin;
}

/** Create and switch off admin accounts. */
export function canManageAdmins(user: HasRole) {
  return user.is_super_admin;
}

/** Pipeline stages and webhook subscriptions. */
export function canManageWorkspace(user: HasRole) {
  return user.is_super_admin;
}

/** Read other admins' assistant chats and see every admin's numbers. */
export function canViewTeam(user: HasRole) {
  return user.is_super_admin;
}

/** "super admin" or "admin", for display. */
export function roleLabel(user: HasRole) {
  return user.is_super_admin ? "super admin" : "admin";
}

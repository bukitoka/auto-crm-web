import type { User, UserRole } from "./types";

type HasRole = Pick<User, "role" | "is_super_admin">;

export const USER_ROLES: UserRole[] = ["member", "admin"];

/** The API enforces the same rules. */
export function isAdmin(user: HasRole) {
  return user.is_super_admin || user.role === "admin";
}

/** Whether `actor` may change `target`: never themselves; other admins only as a super admin. */
export function canManageUser(
  actor: Pick<User, "id" | "role" | "is_super_admin">,
  target: Pick<User, "id" | "role" | "is_super_admin">,
) {
  if (!isAdmin(actor) || actor.id === target.id || target.is_super_admin) return false;
  return target.role !== "admin" || actor.is_super_admin;
}

/** "super admin", "admin" or "member", for display. */
export function roleLabel(user: HasRole) {
  return user.is_super_admin ? "super admin" : user.role;
}

/** Only `admin` exists; the super admin is an admin with `is_super_admin` set. */
export type UserRole = "admin";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  /** Created on the setup page. Reads everything, writes no CRM data, and is not listed on the Team page. */
  is_super_admin: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

/** Nested user reference (owner, assignee, created_by). */
export type UserRef = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
};

export type AdminCreatePayload = {
  email: string;
  password: string;
  full_name: string;
};

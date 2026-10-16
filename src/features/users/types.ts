export type UserRole = "admin" | "member";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  /** Created on the setup page. Has every permission and is not listed as a team member. */
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

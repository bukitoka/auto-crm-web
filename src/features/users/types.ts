export type UserRole = "admin" | "member";

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
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

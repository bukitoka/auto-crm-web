import type { UserRef } from "@/features/users/types";

export type CompanyRef = {
  id: string;
  name: string;
};

export type Company = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  notes: string | null;
  /** Presigned image URL (MinIO), or null when no logo was uploaded. */
  logo_url: string | null;
  owner_id: string | null;
  owner: UserRef | null;
  created_at: string;
  updated_at: string;
};

export type CompanyPayload = {
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  website: string | null;
  notes: string | null;
};

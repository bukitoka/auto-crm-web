import type { CompanyRef } from "@/features/companies/types";
import type { UserRef } from "@/features/users/types";
import type { SortParams } from "@/lib/types";

export const CONTACT_STATUSES = ["lead", "prospect", "customer", "churned"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_SOURCES = [
  "manual",
  "web_form",
  "referral",
  "import",
  "event",
  "other",
] as const;

export type ContactRef = {
  id: string;
  first_name: string;
  last_name: string | null;
};

export type Contact = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  status: ContactStatus;
  source: string;
  tags: string[];
  /** Presigned image URL (MinIO), or null when no photo was uploaded. */
  avatar_url: string | null;
  company_id: string | null;
  company: CompanyRef | null;
  owner_id: string | null;
  owner: UserRef | null;
  ai_score: number | null;
  ai_summary: string | null;
  ai_scored_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactPayload = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  status: ContactStatus;
  source: string;
  tags: string[];
  company_id: string | null;
  owner_id: string | null;
};

export type ContactFilters = SortParams & {
  page: number;
  size: number;
  search?: string;
  status?: string;
  company_id?: string;
  owner_id?: string;
};

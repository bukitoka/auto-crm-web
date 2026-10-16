import type { CompanyRef } from "@/features/companies/types";
import type { ContactRef } from "@/features/contacts/types";
import type { UserRef } from "@/features/users/types";
import type { SortParams } from "@/lib/types";

export type PipelineStage = {
  id: string;
  name: string;
  position: number;
  probability: number;
  is_won: boolean;
  is_lost: boolean;
  /** Deals currently in the stage (all of them, not just the loaded page). */
  deal_count: number;
};

export type StageRef = Pick<PipelineStage, "id" | "name" | "is_won" | "is_lost">;

export type DealRef = {
  id: string;
  title: string;
};

export type Deal = {
  id: string;
  title: string;
  /** numeric(14,2): may arrive as number or string, so always wrap in Number(). */
  value: number | string;
  currency: string;
  stage_id: string;
  stage: StageRef;
  contact_id: string | null;
  contact: ContactRef | null;
  company_id: string | null;
  company: CompanyRef | null;
  owner_id: string | null;
  owner: UserRef | null;
  expected_close_date: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DealPayload = {
  title: string;
  value: number;
  currency: string;
  stage_id: string;
  contact_id: string | null;
  company_id: string | null;
  expected_close_date: string | null;
};

/** `?view=` on the deals page. */
export type DealsView = "board" | "table";

export type DealFilters = SortParams & {
  page: number;
  size: number;
  search?: string;
  stage_id?: string;
  contact_id?: string;
  company_id?: string;
  owner_id?: string;
};

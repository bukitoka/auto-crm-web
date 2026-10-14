import type { ContactRef } from "@/features/contacts/types";
import type { DealRef } from "@/features/deals/types";
import type { UserRef } from "@/features/users/types";

export const ACTIVITY_TYPES = ["note", "call", "email", "meeting"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type Activity = {
  id: string;
  type: ActivityType;
  subject: string;
  body: string | null;
  occurred_at: string;
  contact_id: string | null;
  contact?: ContactRef | null;
  deal_id: string | null;
  deal?: DealRef | null;
  created_by: UserRef | null;
  created_at: string;
};

export type ActivityPayload = {
  type: ActivityType;
  subject: string;
  body: string | null;
  occurred_at: string | null;
  contact_id: string | null;
  deal_id: string | null;
};

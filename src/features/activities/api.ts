import "server-only";
import { apiFetch } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Activity } from "./types";

export function listActivities(filters: {
  contact_id?: string;
  deal_id?: string;
  type?: string;
  page?: number;
  size?: number;
}) {
  return apiFetch<Paginated<Activity>>("/activities", {
    query: { page: 1, size: 50, ...filters },
  });
}

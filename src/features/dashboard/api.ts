import "server-only";
import { apiFetch } from "@/lib/api-client";
import type { DashboardSummary } from "./types";

export function getDashboardSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}

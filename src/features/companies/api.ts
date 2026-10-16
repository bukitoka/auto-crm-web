import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import type { Paginated, SortParams } from "@/lib/types";
import type { Company, CompanyRef } from "./types";

export function listCompanies(
  query: SortParams & { page: number; size: number; search?: string; industry?: string },
) {
  return apiFetch<Paginated<Company>>("/companies", { query });
}

export function getCompany(id: string) {
  return apiFetch<Company>(`/companies/${id}`);
}

export const listCompanyOptions = cache(async (): Promise<CompanyRef[]> => {
  const data = await listCompanies({ page: 1, size: PICKER_PAGE_SIZE });
  return data.items.map(({ id, name }) => ({ id, name }));
});

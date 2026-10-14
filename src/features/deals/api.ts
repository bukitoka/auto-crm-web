import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { getListParams, getParam } from "@/lib/search-params";
import type { Paginated, SearchParams } from "@/lib/types";
import type { Deal, DealFilters, DealRef, DealsView, PipelineStage } from "./types";

/** The board shows every open deal at once (up to the API's max page size). */
export const BOARD_SIZE = 200;

/**
 * Read the deals page URL. The board loads one big page; the table view is
 * paginated and can filter by stage.
 */
export function dealsQueryFromParams(params: SearchParams): {
  view: DealsView;
  filters: DealFilters;
} {
  const view: DealsView = getParam(params, "view") === "table" ? "table" : "board";
  const { page, size, search } = getListParams(params);
  if (view === "board") return { view, filters: { page: 1, size: BOARD_SIZE, search } };
  return { view, filters: { page, size, search, stage_id: getParam(params, "stage_id") } };
}

export function listDeals(filters: DealFilters) {
  return apiFetch<Paginated<Deal>>("/deals", { query: filters });
}

export function getDeal(id: string) {
  return apiFetch<Deal>(`/deals/${id}`);
}

/** Ordered pipeline stages (the endpoint may return a plain array or a page). */
export const listStages = cache(async (): Promise<PipelineStage[]> => {
  const data = await apiFetch<PipelineStage[] | Paginated<PipelineStage>>("/pipeline/stages");
  const stages = Array.isArray(data) ? data : data.items;
  return [...stages].sort((a, b) => a.position - b.position);
});

export const listDealOptions = cache(async (): Promise<DealRef[]> => {
  const data = await listDeals({ page: 1, size: PICKER_PAGE_SIZE });
  return data.items.map(({ id, title }) => ({ id, title }));
});

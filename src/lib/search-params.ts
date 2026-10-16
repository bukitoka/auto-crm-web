import { DEFAULT_PAGE_SIZE } from "./constants";
import type { SearchParams, SortParams } from "./types";

/** Read a single string value from Next.js `searchParams`. */
export function getParam(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : undefined;
}

/** Standard list query (`page`, `size`, `search`) shared by all list pages. */
export function getListParams(params: SearchParams) {
  const page = Math.max(1, Number(getParam(params, "page")) || 1);
  const size = Number(getParam(params, "size")) || DEFAULT_PAGE_SIZE;
  return { page, size, search: getParam(params, "search") };
}

/** `sort` and `order` for sortable tables. The API whitelists the field names. */
export function getSortParams(params: SearchParams): SortParams {
  const sort = getParam(params, "sort");
  if (!sort) return {};
  return { sort, order: getParam(params, "order") === "desc" ? "desc" : "asc" };
}

type SortOrder = NonNullable<SortParams["order"]>;

/**
 * Clicking a column header cycles its sort: `firstOrder`, the opposite order, then off.
 * Text columns start ascending; timestamp columns like "Added" start newest first.
 */
export function nextSort(
  current: SortParams,
  field: string,
  firstOrder: SortOrder = "asc",
): SortParams {
  if (current.sort !== field) return { sort: field, order: firstOrder };
  const currentOrder = current.order ?? "asc";
  if (currentOrder === firstOrder) {
    return { sort: field, order: firstOrder === "asc" ? "desc" : "asc" };
  }
  return { sort: undefined, order: undefined };
}

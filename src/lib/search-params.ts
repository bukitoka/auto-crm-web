import { DEFAULT_PAGE_SIZE } from "./constants";
import type { SearchParams } from "./types";

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

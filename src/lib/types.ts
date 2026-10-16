/** Generic paginated list returned by every FastAPI list endpoint. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

/** Value of a page's `searchParams` prop once awaited. */
export type SearchParams = Record<string, string | string[] | undefined>;

/** Sorting for list endpoints that support `?sort=<field>&order=asc|desc`. */
export type SortParams = { sort?: string; order?: "asc" | "desc" };

/** Result of a CSV import (`POST /<entity>/import`). */
export type ImportResult = {
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

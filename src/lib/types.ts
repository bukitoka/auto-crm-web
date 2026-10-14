/** Generic paginated list returned by every FastAPI list endpoint. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  size: number;
};

/** Value of a page's `searchParams` prop once awaited. */
export type SearchParams = Record<string, string | string[] | undefined>;

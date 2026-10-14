/**
 * Forms keep optional fields as `""` (controlled inputs). The API expects
 * `null` for "no value", so convert before sending.
 */
export function emptyToNull<T extends Record<string, unknown>>(values: T) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    result[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  return result as { [K in keyof T]: T[K] extends string ? T[K] | null : T[K] };
}

import type { Option } from "@/components/shared/option-select";

/** Turn API refs into select options. */
export function toOptions<T extends { id: string }>(
  items: T[],
  label: (item: T) => string,
): Option[] {
  return items.map((item) => ({ value: item.id, label: label(item) }));
}

/** Turn a list of enum values into options with readable labels. */
export function enumOptions(values: readonly string[]): Option[] {
  return values.map((value) => ({
    value,
    label: (value[0]?.toUpperCase() ?? "") + value.slice(1).replaceAll("_", " "),
  }));
}

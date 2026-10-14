"use client";

import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { ComboboxSelect, type Option } from "./combobox-select";

type ParamSelectProps = {
  param: string;
  /** Placeholder shown when the filter is not set, e.g. "All statuses". */
  allLabel: string;
  options: Option[];
};

/** A searchable filter bound to a URL search param (e.g. `?status=lead`). Clearing it removes the param. */
export function ParamSelect({ param, allLabel, options }: ParamSelectProps) {
  const { searchParams, setParams } = useSearchParamUpdater();

  return (
    <ComboboxSelect
      options={options}
      value={searchParams.get(param) ?? ""}
      onChange={(next) => setParams({ [param]: next || undefined })}
      placeholder={allLabel}
      aria-label={allLabel}
      clearable
      className="sm:w-48"
    />
  );
}

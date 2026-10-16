"use client";

import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { ComboboxSelect, type Option } from "./combobox-select";

type ParamSelectProps = {
  param: string;
  allLabel: string;
  options: Option[];
};

/** Clearing the selection removes the search param instead of setting it to `""`. */
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

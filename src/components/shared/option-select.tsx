"use client";

import { ComboboxSelect, type Option } from "./combobox-select";

export type { Option };

type OptionSelectProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  /** Optional relation: show an × button that clears the value to `""`. */
  allowNone?: boolean;
  invalid?: boolean;
};

/** Searchable form select for a list of options; `""` means "nothing selected". */
export function OptionSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  allowNone = false,
  invalid,
}: OptionSelectProps) {
  return (
    <ComboboxSelect
      id={id}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      clearable={allowNone}
      invalid={invalid}
    />
  );
}

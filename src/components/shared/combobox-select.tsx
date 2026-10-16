"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";

export type Option = { value: string; label: string };

type ComboboxSelectProps = {
  options: Option[];
  /** Selected option value; `""` means nothing selected. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Show an × button that clears the selection (sets `""`). */
  clearable?: boolean;
  emptyText?: string;
  id?: string;
  "aria-label"?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
};

/** Works with plain string values so forms and URL params stay simple. */
export function ComboboxSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  clearable = false,
  emptyText = "No results.",
  id,
  "aria-label": ariaLabel,
  invalid,
  disabled,
  className,
}: ComboboxSelectProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      items={options}
      value={selected}
      onValueChange={(option: Option | null) => onChange(option?.value ?? "")}
      isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        disabled={disabled}
        showClear={clearable && selected !== null}
        className={cn("w-full", className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(option: Option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

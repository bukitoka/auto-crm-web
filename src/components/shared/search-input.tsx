"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";

/** Debounced `?search=` input for list pages. */
export function SearchInput({ placeholder = "Search…" }: { placeholder?: string }) {
  const { searchParams, setParams, isPending } = useSearchParamUpdater();
  const current = searchParams.get("search") ?? "";
  const [value, setValue] = useState(current);
  /** The last `?search=` value this input wrote (or saw), to spot changes made elsewhere. */
  const lastSynced = useRef(current);

  // The URL changed somewhere else (nav link, back button): show its value instead
  // of pushing the old text back into the URL.
  useEffect(() => {
    if (current === lastSynced.current) return;
    lastSynced.current = current;
    setValue(current);
  }, [current]);

  useEffect(() => {
    const next = value.trim();
    if (next === current) return;
    const timeout = setTimeout(() => {
      lastSynced.current = next;
      setParams({ search: next || undefined });
    }, 350);
    return () => clearTimeout(timeout);
  }, [value, current, setParams]);

  return (
    <InputGroup className="w-full sm:w-72">
      <InputGroupAddon>{isPending ? <Spinner /> : <Search />}</InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </InputGroup>
  );
}

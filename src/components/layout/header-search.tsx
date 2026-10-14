"use client";

import { Handshake, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { quickSearch } from "@/features/search/actions";
import type { QuickSearchGroup, QuickSearchItem } from "@/features/search/types";

const DEBOUNCE_MS = 200;

function ItemIcon({ item }: { item: QuickSearchItem }) {
  if (item.kind === "contact" || item.kind === "company") {
    return (
      <EntityAvatar
        name={item.title}
        src={item.image}
        shape={item.kind === "company" ? "square" : "circle"}
        className="size-7"
        fallbackClassName="text-[0.6875rem]"
      />
    );
  }
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground [&>svg]:size-3.5">
      {item.kind === "deal" ? <Handshake /> : <Search />}
    </span>
  );
}

/**
 * Global search in the header: a combobox with live, grouped results (contacts,
 * companies, deals). Pick one to open it, or "See all results" for the /search page.
 * ⌘K / Ctrl+K focuses it from anywhere.
 */
export function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState<QuickSearchGroup[]>([]);
  const [isPending, startTransition] = useTransition();
  const latestRequest = useRef(0);

  // Fetch results shortly after the user stops typing; ignore answers to older queries.
  useEffect(() => {
    const search = query.trim();
    if (search.length < 2) {
      setGroups([]);
      return;
    }
    const request = ++latestRequest.current;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const result = await quickSearch(search);
        if (request === latestRequest.current) setGroups(result.ok ? result.data : []);
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function open(item: QuickSearchItem | null) {
    if (!item) return;
    router.push(item.href);
    setQuery("");
    inputRef.current?.blur();
  }

  const hasQuery = query.trim().length >= 2;

  return (
    <div className="hidden w-full max-w-sm md:block">
      <Combobox
        items={groups}
        value={null}
        onValueChange={(item: QuickSearchItem | null) => open(item)}
        inputValue={query}
        onInputValueChange={setQuery}
        filter={null}
        itemToStringLabel={(item: QuickSearchItem) => item.title}
        isItemEqualToValue={(a: QuickSearchItem, b: QuickSearchItem) => a.href === b.href}
        autoHighlight
      >
        <ComboboxInput
          ref={inputRef}
          placeholder="Search contacts, companies, deals…"
          aria-label="Search"
          showTrigger={false}
          className="w-full"
        >
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            {isPending ? (
              <Spinner />
            ) : (
              <kbd className="pointer-events-none hidden rounded-sm border bg-muted px-1.5 font-sans text-[0.6875rem] text-muted-foreground lg:inline">
                ⌘K
              </kbd>
            )}
          </InputGroupAddon>
        </ComboboxInput>
        {hasQuery ? (
          <ComboboxContent className="w-[min(26rem,calc(100vw-2rem))]" align="end">
            <ComboboxEmpty>{isPending ? "Searching…" : "No results."}</ComboboxEmpty>
            <ComboboxList>
              {(group: QuickSearchGroup) => (
                <ComboboxGroup key={group.label} items={group.items}>
                  <ComboboxLabel>{group.label}</ComboboxLabel>
                  <ComboboxCollection>
                    {(item: QuickSearchItem) => (
                      <ComboboxItem key={item.href} value={item} className="gap-3">
                        <ItemIcon item={item} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{item.title}</span>
                          {item.subtitle ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {item.subtitle}
                            </span>
                          ) : null}
                        </span>
                      </ComboboxItem>
                    )}
                  </ComboboxCollection>
                </ComboboxGroup>
              )}
            </ComboboxList>
          </ComboboxContent>
        ) : null}
      </Combobox>
    </div>
  );
}

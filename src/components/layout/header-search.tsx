"use client";

import { Handshake, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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

/** The trigger sits in the header; the search itself is a command dialog. ⌘K / Ctrl+K opens it. */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setGroups([]);
    }
  }

  function openItem(item: QuickSearchItem) {
    router.push(item.href);
    handleOpenChange(false);
  }

  const hasQuery = query.trim().length >= 2;

  return (
    <>
      <Button
        variant="outline"
        className="px-0 font-normal text-muted-foreground max-md:size-10 md:w-64 md:justify-start md:px-4"
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search />
        <span className="hidden flex-1 text-left md:inline">Search…</span>
        <kbd className="pointer-events-none hidden rounded-sm border bg-muted px-1.5 font-sans text-[0.6875rem] lg:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="Search"
        description="Search contacts, companies and deals."
      >
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Search contacts, companies, deals…"
            aria-label="Search contacts, companies and deals"
          />
          <CommandList>
            {hasQuery ? (
              <CommandEmpty>
                {isPending ? <Spinner className="mx-auto" /> : "No results."}
              </CommandEmpty>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search contacts, companies and deals.
              </p>
            )}
            {groups.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.items.map((item) => (
                  <CommandItem
                    key={item.href}
                    value={`${item.kind}-${item.id}`}
                    onSelect={() => openItem(item)}
                    className="gap-3"
                  >
                    <ItemIcon item={item} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.title}</span>
                      {item.subtitle ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}

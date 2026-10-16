"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import { TableHead } from "@/components/ui/table";
import { useSearchParamUpdater } from "@/hooks/use-search-param-updater";
import { nextSort } from "@/lib/search-params";
import { cn } from "@/lib/utils";

type SortableHeaderProps = {
  /** API sort field, e.g. "name" → `?sort=name&order=asc`. */
  field: string;
  /** Order applied on the first click. Use "desc" for timestamps so newest comes first. */
  firstOrder?: "asc" | "desc";
  children: ReactNode;
  className?: string;
};

/** Clicking cycles `firstOrder` (ascending by default), the opposite order, then off. */
export function SortableHeader({
  field,
  firstOrder = "asc",
  children,
  className,
}: SortableHeaderProps) {
  const { searchParams, setParams } = useSearchParamUpdater();
  const sort = searchParams.get("sort") ?? undefined;
  const order = searchParams.get("order") === "desc" ? "desc" : "asc";
  const active = sort === field ? order : undefined;
  const Icon = active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <TableHead
      className={className}
      aria-sort={active ? (active === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        onClick={() => setParams(nextSort({ sort, order }, field, firstOrder))}
        className="-mx-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
        <Icon className={cn("size-3.5", active ? "text-primary" : "text-muted-foreground")} />
      </button>
    </TableHead>
  );
}

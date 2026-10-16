import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { SearchParams } from "@/lib/types";

type PaginationBarProps = {
  pathname: string;
  searchParams: SearchParams;
  page: number;
  size: number;
  total: number;
};

function hrefForPage(pathname: string, searchParams: SearchParams, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && key !== "page") params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function PaginationBar({ pathname, searchParams, page, size, total }: PaginationBarProps) {
  const pageCount = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">
          Page {page} of {pageCount}
        </span>
        <Button variant="outline" size="icon-sm" asChild={page > 1} disabled={page <= 1}>
          {page > 1 ? (
            <Link href={hrefForPage(pathname, searchParams, page - 1)} aria-label="Previous page">
              <ChevronLeft />
            </Link>
          ) : (
            <ChevronLeft />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          asChild={page < pageCount}
          disabled={page >= pageCount}
        >
          {page < pageCount ? (
            <Link href={hrefForPage(pathname, searchParams, page + 1)} aria-label="Next page">
              <ChevronRight />
            </Link>
          ) : (
            <ChevronRight />
          )}
        </Button>
      </div>
    </div>
  );
}

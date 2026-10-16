import Link from "next/link";
import type { Deal } from "@/features/deals/types";
import { formatCurrency, formatDate } from "@/lib/format";

/** Open deals expected to close in the next 30 days, soonest first. */
export function ClosingSoonList({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No open deals expected to close in the next 30 days.
      </p>
    );
  }

  return (
    <ul className="divide-y">
      {deals.map((deal) => (
        <li key={deal.id} className="flex items-center gap-3 py-2.5">
          <div className="min-w-0 flex-1">
            <Link
              href={`/deals/${deal.id}`}
              className="block truncate text-sm font-medium hover:underline"
            >
              {deal.title}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {formatDate(deal.expected_close_date)} · {deal.stage.name}
              {deal.owner ? ` · ${deal.owner.full_name}` : null}
            </p>
          </div>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(deal.value, deal.currency)}
          </span>
        </li>
      ))}
    </ul>
  );
}

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { Deal } from "../types";
import { DealStageBadge } from "./deal-stage-badge";

/** Compact list of deals for contact/company detail pages. */
export function DealList({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No deals yet.</p>;
  }

  return (
    <ul className="divide-y">
      {deals.map((deal) => (
        <li key={deal.id} className="flex items-center justify-between gap-3 py-2.5">
          <div className="min-w-0">
            <Link
              href={`/deals/${deal.id}`}
              className="block truncate text-sm font-medium hover:underline"
            >
              {deal.title}
            </Link>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatCurrency(deal.value, deal.currency)}
            </span>
          </div>
          <DealStageBadge stage={deal.stage} />
        </li>
      ))}
    </ul>
  );
}

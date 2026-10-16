import { Handshake } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { SortableHeader } from "@/components/shared/sortable-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatDateTime, personName } from "@/lib/format";
import { deleteDeal } from "../actions";
import type { Deal } from "../types";
import { DealStageBadge } from "./deal-stage-badge";

export function DealsTable({ deals, readOnly = false }: { deals: Deal[]; readOnly?: boolean }) {
  if (deals.length === 0) {
    return (
      <EmptyState
        icon={Handshake}
        title="No deals found"
        description={
          readOnly ? "No admin has added deals yet." : "Add a deal to start tracking your pipeline."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="title">Deal</SortableHeader>
            <SortableHeader field="value" className="text-right">
              Value
            </SortableHeader>
            <SortableHeader field="stage">Stage</SortableHeader>
            <TableHead className="hidden md:table-cell">Contact / company</TableHead>
            <SortableHeader field="expected_close_date" className="hidden lg:table-cell">
              Expected close
            </SortableHeader>
            <TableHead className="hidden lg:table-cell">Owner</TableHead>
            <SortableHeader field="created_at" firstOrder="desc" className="hidden xl:table-cell">
              Added
            </SortableHeader>
            {readOnly ? null : (
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow key={deal.id}>
              <TableCell>
                <Link href={`/deals/${deal.id}`} className="font-medium hover:underline">
                  {deal.title}
                </Link>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(deal.value, deal.currency)}
              </TableCell>
              <TableCell>
                <DealStageBadge stage={deal.stage} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {[deal.contact ? personName(deal.contact) : null, deal.company?.name]
                  .filter(Boolean)
                  .join(" · ") || "Not set"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {formatDate(deal.expected_close_date)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {deal.owner?.full_name ?? "Not set"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground xl:table-cell">
                <time dateTime={deal.created_at} title={formatDateTime(deal.created_at)}>
                  {formatDate(deal.created_at)}
                </time>
              </TableCell>
              {readOnly ? null : (
                <TableCell>
                  <ConfirmDeleteButton
                    title={`Delete "${deal.title}"?`}
                    action={deleteDeal.bind(null, deal.id)}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

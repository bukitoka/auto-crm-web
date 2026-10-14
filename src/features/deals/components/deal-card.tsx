"use client";

import { useDraggable } from "@dnd-kit/core";
import { CalendarDays, GripVertical } from "lucide-react";
import Link from "next/link";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { formatCurrency, formatDate, personName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Deal } from "../types";

type DealCardProps = {
  deal: Deal;
  /** Rendered inside the DragOverlay (the copy that follows the pointer). */
  isOverlay?: boolean;
  /** Drag handle shown in the top-right corner. */
  handle?: React.ReactNode;
};

/** Presentational deal card on the canvas. */
export function DealCard({ deal, isOverlay = false, handle }: DealCardProps) {
  const related = deal.contact ? personName(deal.contact) : deal.company?.name;

  return (
    <article
      className={cn(
        "group/deal relative flex flex-col gap-3 rounded-md border bg-card p-4 text-card-foreground transition-colors hover:border-primary/40",
        isOverlay && "rotate-2 cursor-grabbing border-primary",
      )}
    >
      <div className="flex items-start gap-2">
        <Link
          href={`/deals/${deal.id}`}
          draggable={false}
          className="line-clamp-2 flex-1 text-sm font-medium hover:underline"
        >
          {deal.title}
        </Link>
        {handle ?? <GripVertical className="size-4 text-muted-foreground" aria-hidden />}
      </div>

      <p className="text-lg font-semibold tabular-nums tracking-tight">
        {formatCurrency(deal.value, deal.currency)}
      </p>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="min-w-0 space-y-1">
          {related ? <p className="truncate">{related}</p> : null}
          {deal.expected_close_date ? (
            <p className="flex items-center gap-1">
              <CalendarDays className="size-3" />
              {formatDate(deal.expected_close_date)}
            </p>
          ) : null}
        </div>
        {deal.owner ? (
          <EntityAvatar
            name={deal.owner.full_name}
            src={deal.owner.avatar_url}
            className="size-7"
            fallbackClassName="text-[0.6875rem]"
          />
        ) : null}
      </div>
    </article>
  );
}

/**
 * A deal card you can drag between stage lanes.
 * Mouse/touch: drag the card from anywhere. Keyboard: focus the grip button,
 * press Space, move with the arrow keys, press Space again to drop.
 */
export function DraggableDealCard({ deal }: { deal: Deal }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label={`Move ${deal.title}`}
      className="-mt-1 -mr-2 rounded-full p-1 text-muted-foreground opacity-60 outline-none transition-opacity group-hover/deal:opacity-100 focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
      {...attributes}
    >
      <GripVertical className="size-4" />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      data-no-pan
      className={cn("cursor-grab", isDragging && "opacity-40")}
    >
      <DealCard deal={deal} handle={handle} />
    </div>
  );
}

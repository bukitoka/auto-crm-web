"use client";

import { useDroppable } from "@dnd-kit/core";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StageColumn } from "../board";

type StageLaneProps = {
  column: StageColumn;
  dotClassName: string;
  children: React.ReactNode;
  readOnly?: boolean;
};

/** The whole lane is a drop target, not just the card list. */
export function StageLane({ column, dotClassName, children, readOnly = false }: StageLaneProps) {
  const { stage, deals, total } = column;
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const headingId = `stage-${stage.id}`;

  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      data-no-pan
      className={cn(
        "flex w-80 shrink-0 cursor-default flex-col rounded-lg border bg-card/70 backdrop-blur-sm transition-colors",
        isOver && "border-primary bg-accent/80",
      )}
    >
      <header className="flex items-center gap-2 px-5 pt-4 pb-3">
        <span className={cn("size-2.5 rounded-full", dotClassName)} aria-hidden />
        <h2 id={headingId} className="text-sm font-semibold">
          {stage.name}
        </h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
          <span aria-hidden>{deals.length}</span>
          <span className="sr-only">{deals.length} deals</span>
        </span>
        <span className="ml-auto text-xs font-medium text-muted-foreground tabular-nums">
          {formatCurrency(total)}
        </span>
      </header>

      <div className="flex min-h-36 flex-col gap-3 px-3 pb-3">
        {deals.length > 0 ? (
          children
        ) : (
          <p className="flex flex-1 items-center justify-center rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
            {readOnly ? "No deals" : "Drop deals here"}
          </p>
        )}
      </div>
    </section>
  );
}

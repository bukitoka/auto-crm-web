"use client";

import {
  type Announcements,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useOptimistic, useRef, useState, useTransition } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDragToPan } from "@/hooks/use-drag-to-pan";
import { toastResult } from "@/lib/toast-result";
import { moveDealToStage } from "../actions";
import { groupDealsByStage, moveDeal, stageDotClasses } from "../board";
import type { Deal, PipelineStage } from "../types";
import { DealCard, DraggableDealCard } from "./deal-card";
import { StageLane } from "./stage-lane";

type DealsCanvasProps = {
  deals: Deal[];
  stages: PipelineStage[];
};

type Move = { dealId: string; stage: PipelineStage };

/**
 * Pipeline board on a pannable, dotted canvas.
 * Drag a deal onto another stage to move it: the UI updates immediately
 * (optimistic), then the server action saves it. If saving fails, the deal
 * snaps back and an error toast is shown.
 */
export function DealsCanvas({ deals, stages }: DealsCanvasProps) {
  const [optimisticDeals, applyMove] = useOptimistic(deals, (current: Deal[], move: Move) =>
    moveDeal(current, move.dealId, move.stage),
  );
  const [, startTransition] = useTransition();
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  useDragToPan(canvasRef);

  const sensors = useSensors(
    // Small distance/delay so clicking the title link still works.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const columns = groupDealsByStage(optimisticDeals, stages);
  const dotClasses = stageDotClasses(stages);
  const stageName = (id: unknown) => stages.find((stage) => stage.id === id)?.name ?? "a stage";
  const dealTitle = (id: unknown) => deals.find((deal) => deal.id === id)?.title ?? "deal";

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${dealTitle(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `${dealTitle(active.id)} is over ${stageName(over.id)}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? `${dealTitle(active.id)} was dropped on ${stageName(over.id)}.`
        : `${dealTitle(active.id)} was dropped.`,
    onDragCancel: ({ active }) => `Moving ${dealTitle(active.id)} was cancelled.`,
  };

  function handleDragStart({ active }: DragStartEvent) {
    setActiveDeal(optimisticDeals.find((deal) => deal.id === active.id) ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveDeal(null);
    const deal = optimisticDeals.find((d) => d.id === active.id);
    const stage = stages.find((s) => s.id === over?.id);
    if (!deal || !stage || deal.stage_id === stage.id) return;

    startTransition(async () => {
      applyMove({ dealId: deal.id, stage });
      const result = await moveDealToStage(deal.id, stage.id);
      toastResult(result, `Moved “${deal.title}” to ${stage.name}`);
    });
  }

  return (
    <DndContext
      id="deals-canvas"
      sensors={sensors}
      accessibility={{ announcements }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDeal(null)}
    >
      {/* Custom scrollbars (Radix ScrollArea); useDragToPan works on its viewport. */}
      <ScrollArea
        type="auto"
        scrollbars="both"
        viewportRef={canvasRef}
        className="bg-canvas-dots -mx-4 h-[calc(100svh-14rem)] min-h-[28rem] cursor-grab border-y has-data-[panning=true]:cursor-grabbing has-data-[panning=true]:select-none md:mx-0 md:rounded-lg md:border"
      >
        <div className="flex min-w-max items-start gap-5 p-5 md:p-6">
          {columns.map((column) => (
            <StageLane
              key={column.stage.id}
              column={column}
              dotClassName={dotClasses[column.stage.id]}
            >
              {column.deals.map((deal) => (
                <DraggableDealCard key={deal.id} deal={deal} />
              ))}
            </StageLane>
          ))}
        </div>
      </ScrollArea>

      <DragOverlay>{activeDeal ? <DealCard deal={activeDeal} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
}

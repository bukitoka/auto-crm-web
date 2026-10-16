"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { GripVertical, Settings2, Trash2 } from "lucide-react";
import { type FocusEvent, type MouseEvent, useOptimistic, useState, useTransition } from "react";
import { ComboboxSelect } from "@/components/shared/combobox-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { cn } from "@/lib/utils";
import { reorderById } from "../board";
import type { StageFormValues } from "../schemas";
import { deleteStage, reorderStages, updateStage } from "../stage-actions";
import type { PipelineStage } from "../types";
import { AddStageForm } from "./add-stage-form";

const KIND_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

function stageKind(stage: PipelineStage) {
  return stage.is_won ? "won" : stage.is_lost ? "lost" : "open";
}

/** Every change saves immediately; there is no separate save step. */
export function PipelineEditor({ stages }: { stages: PipelineStage[] }) {
  const [optimisticStages, setOptimisticStages] = useOptimistic(stages);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return;
    const next = reorderById(optimisticStages, String(active.id), String(over.id));
    if (next === optimisticStages) return;
    startTransition(async () => {
      setOptimisticStages(next);
      toastResult(await reorderStages(next.map((stage) => stage.id)));
    });
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Settings2 />
          Edit pipeline
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit pipeline</SheetTitle>
          <SheetDescription>Drag stages to reorder them. Changes save as you go.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <DndContext
            id="pipeline-editor"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <ol className="flex flex-col gap-2">
              {optimisticStages.map((stage) => (
                <StageRow key={stage.id} stage={stage} stages={optimisticStages} />
              ))}
            </ol>
          </DndContext>
        </div>
        <SheetFooter className="border-t">
          <AddStageForm />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type StageRowProps = {
  stage: PipelineStage;
  stages: PipelineStage[];
};

function StageRow({ stage, stages }: StageRowProps) {
  const drag = useDraggable({ id: stage.id });
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: stage.id });
  const [isPending, startTransition] = useTransition();
  const y = drag.transform?.y ?? 0;

  function save(values: Partial<StageFormValues>, input?: HTMLInputElement, reset?: string) {
    startTransition(async () => {
      const result = await updateStage(stage.id, values);
      if (!toastResult(result) && input && reset !== undefined) input.value = reset;
    });
  }

  function saveName(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const name = input.value.trim();
    if (!name) input.value = stage.name;
    else if (name !== stage.name) save({ name }, input, stage.name);
  }

  function saveProbability(event: FocusEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const probability = Number(input.value);
    if (input.value === "" || probability === stage.probability) {
      input.value = String(stage.probability);
    } else {
      save({ probability }, input, String(stage.probability));
    }
  }

  return (
    <li
      ref={(node) => {
        drag.setNodeRef(node);
        setDropRef(node);
      }}
      style={y ? { transform: `translate3d(0, ${y}px, 0)` } : undefined}
      className={cn(
        "flex items-start gap-2 rounded-md border bg-card p-2 transition-colors",
        isOver && !drag.isDragging && "border-primary",
        drag.isDragging && "relative z-10 border-primary",
      )}
    >
      <button
        ref={drag.setActivatorNodeRef}
        type="button"
        aria-label={`Move ${stage.name}`}
        className="mt-2 cursor-grab rounded-full p-1 text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        {...drag.attributes}
        {...drag.listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="grid flex-1 gap-2">
        <Input
          key={stage.name}
          defaultValue={stage.name}
          aria-label="Stage name"
          maxLength={100}
          className="h-9"
          disabled={isPending}
          onBlur={saveName}
          onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
        />
        <div className="flex items-center gap-2">
          <div className="relative w-24 shrink-0">
            <Input
              key={stage.probability}
              type="number"
              min={0}
              max={100}
              defaultValue={stage.probability}
              aria-label="Win probability (%)"
              className="h-9 pr-8"
              disabled={isPending}
              onBlur={saveProbability}
              onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
            />
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
          <ComboboxSelect
            options={KIND_OPTIONS}
            value={stageKind(stage)}
            onChange={(kind) => kind && save({ is_won: kind === "won", is_lost: kind === "lost" })}
            aria-label="Stage type"
            disabled={isPending}
            className="h-9"
          />
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {stage.deal_count} {stage.deal_count === 1 ? "deal" : "deals"}
          </span>
        </div>
      </div>
      <DeleteStageButton stage={stage} stages={stages} />
    </li>
  );
}

function DeleteStageButton({ stage, stages }: StageRowProps) {
  const [open, setOpen] = useState(false);
  const [moveTo, setMoveTo] = useState("");
  const [isPending, startTransition] = useTransition();
  const hasDeals = stage.deal_count > 0;
  const targets = stages
    .filter((s) => s.id !== stage.id)
    .map((s) => ({ value: s.id, label: s.name }));

  function handleConfirm(event: MouseEvent) {
    event.preventDefault(); // keep the dialog open while the action runs
    startTransition(async () => {
      const result = await deleteStage(stage.id, hasDeals ? moveTo : undefined);
      if (toastResult(result, `Deleted “${stage.name}”`)) setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${stage.name}`}>
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{stage.name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasDeals
              ? `It has ${stage.deal_count} ${stage.deal_count === 1 ? "deal" : "deals"}. Choose where to move them.`
              : "This cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {hasDeals ? (
          <ComboboxSelect
            options={targets}
            value={moveTo}
            onChange={setMoveTo}
            placeholder="Move deals to…"
            aria-label="Move deals to"
          />
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || (hasDeals && !moveTo)}
          >
            {isPending ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

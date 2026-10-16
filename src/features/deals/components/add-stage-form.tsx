"use client";

import { Plus } from "lucide-react";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { createStage } from "../stage-actions";

type AddStageFormProps = {
  autoFocus?: boolean;
  onAdded?: () => void;
};

/** Name-only quick add; the stage is open, 0% and placed before Won/Lost. */
export function AddStageForm({ autoFocus, onAdded }: AddStageFormProps) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createStage({ name, probability: 0, is_won: false, is_lost: false });
      if (!toastResult(result, `Added “${result.ok ? result.data.name : name}”`)) return;
      setName("");
      onAdded?.();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="New stage name"
        aria-label="New stage name"
        maxLength={100}
        autoFocus={autoFocus}
        disabled={isPending}
      />
      <Button type="submit" disabled={isPending || !name.trim()}>
        {isPending ? <Spinner /> : <Plus />}
        Add
      </Button>
    </form>
  );
}

export function AddStageLane() {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <section
      aria-label="Add stage"
      data-no-pan
      className="flex w-80 shrink-0 cursor-default flex-col gap-3 rounded-lg border border-dashed bg-card/40 p-3 transition-colors hover:border-primary"
    >
      {isAdding ? (
        <>
          <AddStageForm autoFocus onAdded={() => setIsAdding(false)} />
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="text-xs text-muted-foreground">Added before Won and Lost.</p>
            <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <Button variant="ghost" className="text-muted-foreground" onClick={() => setIsAdding(true)}>
          <Plus />
          Add stage
        </Button>
      )}
    </section>
  );
}

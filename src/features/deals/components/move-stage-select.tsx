"use client";

import { useTransition } from "react";
import { ComboboxSelect } from "@/components/shared/combobox-select";
import { toastResult } from "@/lib/toast-result";
import { moveDealToStage } from "../actions";
import type { PipelineStage } from "../types";

type MoveStageSelectProps = {
  dealId: string;
  stageId: string;
  stages: PipelineStage[];
};

/** "Move to stage" control on the deal page. */
export function MoveStageSelect({ dealId, stageId, stages }: MoveStageSelectProps) {
  const [isPending, startTransition] = useTransition();
  const options = stages.map((stage) => ({ value: stage.id, label: stage.name }));

  function handleChange(nextStageId: string) {
    if (!nextStageId || nextStageId === stageId) return;
    const stage = stages.find((s) => s.id === nextStageId);
    startTransition(async () => {
      const result = await moveDealToStage(dealId, nextStageId);
      toastResult(result, `Moved to ${stage?.name ?? "stage"}`);
    });
  }

  return (
    <ComboboxSelect
      options={options}
      value={stageId}
      onChange={handleChange}
      aria-label="Move to stage"
      disabled={isPending}
    />
  );
}

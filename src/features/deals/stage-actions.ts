"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type StageFormValues, stageFormSchema } from "./schemas";
import type { PipelineStage } from "./types";

// Stage names show up on the board, deal pages and the dashboard.
function revalidatePipeline() {
  revalidatePath("/deals", "layout");
  revalidatePath("/dashboard");
}

export async function createStage(values: StageFormValues): Promise<ActionResult<PipelineStage>> {
  const parsed = parseInput(stageFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<PipelineStage>("/pipeline/stages", { method: "POST", body: parsed.data }),
  );
  if (result.ok) revalidatePipeline();
  return result;
}

export async function updateStage(
  id: string,
  values: Partial<StageFormValues>,
): Promise<ActionResult<PipelineStage>> {
  const parsed = parseInput(stageFormSchema.partial(), values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<PipelineStage>(`/pipeline/stages/${id}`, { method: "PATCH", body: parsed.data }),
  );
  if (result.ok) revalidatePipeline();
  return result;
}

export async function reorderStages(stageIds: string[]): Promise<ActionResult<PipelineStage[]>> {
  const result = await runAction(() =>
    apiFetch<PipelineStage[]>("/pipeline/stages/order", {
      method: "PUT",
      body: { stage_ids: stageIds },
    }),
  );
  if (result.ok) revalidatePipeline();
  return result;
}

/** Deals in the stage are moved to `moveTo` first (the API requires it when there are any). */
export async function deleteStage(id: string, moveTo?: string): Promise<ActionResult> {
  const result = await runAction(() =>
    apiFetch<void>(`/pipeline/stages/${id}`, { method: "DELETE", query: { move_to: moveTo } }),
  );
  if (result.ok) revalidatePipeline();
  return result;
}

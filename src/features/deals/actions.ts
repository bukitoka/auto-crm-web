"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type DealFormValues, dealFormSchema, toDealPayload } from "./schemas";
import type { Deal } from "./types";

function revalidateDeal(id?: string) {
  revalidatePath("/deals");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/deals/${id}`);
}

export async function createDeal(values: DealFormValues): Promise<ActionResult<Deal>> {
  const parsed = parseInput(dealFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Deal>("/deals", { method: "POST", body: toDealPayload(parsed.data) }),
  );
  if (result.ok) revalidateDeal();
  return result;
}

export async function updateDeal(id: string, values: DealFormValues): Promise<ActionResult<Deal>> {
  const parsed = parseInput(dealFormSchema, values);
  if (!parsed.ok) return parsed;

  // Stage changes go through the dedicated endpoint so the API emits events.
  const { stage_id, ...rest } = toDealPayload(parsed.data);
  const result = await runAction(async () => {
    const deal = await apiFetch<Deal>(`/deals/${id}`, { method: "PATCH", body: rest });
    if (deal.stage_id === stage_id) return deal;
    return apiFetch<Deal>(`/deals/${id}/stage`, { method: "PATCH", body: { stage_id } });
  });
  if (result.ok) revalidateDeal(id);
  return result;
}

export async function moveDealToStage(id: string, stageId: string): Promise<ActionResult<Deal>> {
  const result = await runAction(() =>
    apiFetch<Deal>(`/deals/${id}/stage`, { method: "PATCH", body: { stage_id: stageId } }),
  );
  if (result.ok) revalidateDeal(id);
  return result;
}

export async function deleteDeal(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/deals/${id}`, { method: "DELETE" }));
  if (result.ok) revalidateDeal();
  return result;
}

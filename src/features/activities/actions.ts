"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type ActivityFormValues, activityFormSchema, toActivityPayload } from "./schemas";
import type { Activity } from "./types";

function revalidateLinked(contactId?: string | null, dealId?: string | null) {
  if (contactId) revalidatePath(`/contacts/${contactId}`);
  if (dealId) revalidatePath(`/deals/${dealId}`);
  revalidatePath("/dashboard");
}

export async function createActivity(values: ActivityFormValues): Promise<ActionResult<Activity>> {
  const parsed = parseInput(activityFormSchema, values);
  if (!parsed.ok) return parsed;

  const payload = toActivityPayload(parsed.data);
  const result = await runAction(() =>
    apiFetch<Activity>("/activities", { method: "POST", body: payload }),
  );
  if (result.ok) revalidateLinked(payload.contact_id, payload.deal_id);
  return result;
}

export async function deleteActivity(
  id: string,
  link: { contactId?: string | null; dealId?: string | null },
): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/activities/${id}`, { method: "DELETE" }));
  if (result.ok) revalidateLinked(link.contactId, link.dealId);
  return result;
}

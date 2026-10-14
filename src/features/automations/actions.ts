"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type WebhookFormValues, webhookFormSchema } from "./schemas";
import type { WebhookSubscription } from "./types";

export async function createWebhook(
  values: WebhookFormValues,
): Promise<ActionResult<WebhookSubscription>> {
  const parsed = parseInput(webhookFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<WebhookSubscription>("/webhooks", { method: "POST", body: parsed.data }),
  );
  if (result.ok) revalidatePath("/automations");
  return result;
}

export async function updateWebhook(
  id: string,
  values: WebhookFormValues,
): Promise<ActionResult<WebhookSubscription>> {
  const parsed = parseInput(webhookFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<WebhookSubscription>(`/webhooks/${id}`, { method: "PATCH", body: parsed.data }),
  );
  if (result.ok) revalidatePath("/automations");
  return result;
}

export async function toggleWebhook(
  id: string,
  isActive: boolean,
): Promise<ActionResult<WebhookSubscription>> {
  const result = await runAction(() =>
    apiFetch<WebhookSubscription>(`/webhooks/${id}`, {
      method: "PATCH",
      body: { is_active: isActive },
    }),
  );
  if (result.ok) revalidatePath("/automations");
  return result;
}

export async function deleteWebhook(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/webhooks/${id}`, { method: "DELETE" }));
  if (result.ok) revalidatePath("/automations");
  return result;
}

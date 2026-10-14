import "server-only";
import { apiFetch } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { WebhookSubscription } from "./types";

/** The list endpoint may return a plain array or a page; normalize to an array. */
export async function listWebhooks(): Promise<WebhookSubscription[]> {
  const data = await apiFetch<WebhookSubscription[] | Paginated<WebhookSubscription>>("/webhooks", {
    query: { size: 100 },
  });
  return Array.isArray(data) ? data : data.items;
}

/** Event names, e.g. `contact.created`. Accepts `string[]` or `{events: string[]}`. */
export async function listWebhookEvents(): Promise<string[]> {
  const data = await apiFetch<string[] | { events: string[] }>("/webhooks/events");
  return Array.isArray(data) ? data : data.events;
}

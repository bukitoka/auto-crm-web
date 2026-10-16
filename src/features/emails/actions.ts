"use server";

import { revalidatePath } from "next/cache";
import type { Activity } from "@/features/activities/types";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { type SendEmailValues, sendEmailSchema } from "./schemas";

/**
 * Email a contact through the API (sent through Brevo). Replies go to
 * the signed-in user, and the email is logged on the contact's timeline.
 */
export async function sendEmail(
  contactId: string,
  values: SendEmailValues,
): Promise<ActionResult<Activity>> {
  const parsed = parseInput(sendEmailSchema, values);
  if (!parsed.ok) return parsed;

  const { subject, body, deal_id } = parsed.data;
  const result = await runAction(() =>
    apiFetch<Activity>("/emails", {
      method: "POST",
      body: { contact_id: contactId, subject, body, deal_id: deal_id || null },
    }),
  );
  if (result.ok) {
    revalidatePath(`/contacts/${contactId}`);
    if (deal_id) revalidatePath(`/deals/${deal_id}`);
  }
  return result;
}

"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseFileUpload } from "@/lib/uploads";
import {
  type EmailDraftValues,
  type ExtractContactValues,
  emailDraftSchema,
  extractContactSchema,
} from "./schemas";
import type {
  CapturedContact,
  EmailDraft,
  ExtractedContact,
  LeadScore,
  TimelineSummary,
} from "./types";

/** AI calls can take several seconds; the UI shows pending states meanwhile. */

export async function scoreContact(contactId: string): Promise<ActionResult<LeadScore>> {
  const result = await runAction(() =>
    apiFetch<LeadScore>(`/ai/contacts/${contactId}/score`, { method: "POST" }),
  );
  if (result.ok) {
    revalidatePath(`/contacts/${contactId}`);
    revalidatePath("/contacts");
  }
  return result;
}

export async function draftEmail(
  contactId: string,
  values: EmailDraftValues,
): Promise<ActionResult<EmailDraft>> {
  const parsed = parseInput(emailDraftSchema, values);
  if (!parsed.ok) return parsed;

  const { purpose, tone, deal_id } = parsed.data;
  return runAction(() =>
    apiFetch<EmailDraft>("/ai/email-draft", {
      method: "POST",
      body: { contact_id: contactId, deal_id: deal_id || null, purpose, tone },
    }),
  );
}

export async function summarizeTimeline(target: {
  contactId?: string;
  dealId?: string;
}): Promise<ActionResult<TimelineSummary>> {
  return runAction(() =>
    apiFetch<TimelineSummary>("/ai/summarize", {
      method: "POST",
      body: { contact_id: target.contactId ?? null, deal_id: target.dealId ?? null },
    }),
  );
}

export async function extractContact(
  values: ExtractContactValues,
): Promise<ActionResult<ExtractedContact>> {
  const parsed = parseInput(extractContactSchema, values);
  if (!parsed.ok) return parsed;

  return runAction(() =>
    apiFetch<ExtractedContact>("/ai/extract-contact", { method: "POST", body: parsed.data }),
  );
}

/**
 * Smart capture from a file: photo or screenshot (read with OCR), PDF, Word, email or
 * text file. The API turns it into text, then the AI extracts the contact fields.
 */
export async function extractContactFromFile(
  formData: FormData,
): Promise<ActionResult<CapturedContact>> {
  const parsed = parseFileUpload(formData);
  if (!parsed.ok) return parsed;

  return runAction(() =>
    apiFetch<CapturedContact>("/ai/extract-contact/file", { method: "POST", body: parsed.data }),
  );
}

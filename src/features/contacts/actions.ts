"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseImageUpload } from "@/lib/uploads";
import { type ContactFormValues, contactFormSchema, toContactPayload } from "./schemas";
import type { Contact } from "./types";

export async function createContact(values: ContactFormValues): Promise<ActionResult<Contact>> {
  const parsed = parseInput(contactFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Contact>("/contacts", { method: "POST", body: toContactPayload(parsed.data) }),
  );
  if (result.ok) revalidatePath("/contacts");
  return result;
}

export async function updateContact(
  id: string,
  values: ContactFormValues,
): Promise<ActionResult<Contact>> {
  const parsed = parseInput(contactFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Contact>(`/contacts/${id}`, { method: "PATCH", body: toContactPayload(parsed.data) }),
  );
  if (result.ok) {
    revalidatePath("/contacts");
    revalidatePath(`/contacts/${id}`);
  }
  return result;
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/contacts/${id}`, { method: "DELETE" }));
  if (result.ok) revalidatePath("/contacts");
  return result;
}

function revalidateContact(id: string) {
  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
}

/** Upload a contact photo (`formData.get("file")`). The API stores it in MinIO. */
export async function uploadContactAvatar(
  id: string,
  formData: FormData,
): Promise<ActionResult<Contact>> {
  const parsed = parseImageUpload(formData);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Contact>(`/contacts/${id}/avatar`, { method: "PUT", body: parsed.data }),
  );
  if (result.ok) revalidateContact(id);
  return result;
}

export async function removeContactAvatar(id: string): Promise<ActionResult<Contact>> {
  const result = await runAction(() =>
    apiFetch<Contact>(`/contacts/${id}/avatar`, { method: "DELETE" }),
  );
  if (result.ok) revalidateContact(id);
  return result;
}

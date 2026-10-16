"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { MAX_ATTACHMENTS, MAX_RECORDING_BYTES, MAX_UPLOAD_BYTES } from "@/lib/constants";
import type { Paginated } from "@/lib/types";
import type {
  BulkConversationAction,
  ChatTurn,
  Conversation,
  ConversationFilters,
  PageContext,
} from "./types";

const BASE = "/assistant/conversations";
const MAX_LENGTH = 4000;

/** Text is optional when files are attached (`attachments` holds them as `files` entries). */
function checkMessage(content: string, attachments?: FormData) {
  const text = content.trim();
  const files = (attachments?.getAll("files") ?? []).filter((file) => file instanceof File);
  if (!text && files.length === 0) {
    return { ok: false as const, error: "Type a message first", status: 422 };
  }
  if (files.length > MAX_ATTACHMENTS) {
    return { ok: false as const, error: `Attach at most ${MAX_ATTACHMENTS} files`, status: 422 };
  }
  const tooBig = files.find((file) => file.size > MAX_UPLOAD_BYTES);
  if (tooBig) {
    return { ok: false as const, error: `${tooBig.name} is larger than 5 MB`, status: 413 };
  }
  return { ok: true as const, text: text.slice(0, MAX_LENGTH), files };
}

/** JSON for text only; with files, multipart to the `/with-files` variant (the API reads them). */
function post(path: string, text: string, context: PageContext | null, files: File[]) {
  if (files.length === 0) {
    return apiFetch<ChatTurn>(path, { method: "POST", body: { content: text, context } });
  }
  const body = new FormData();
  body.set("content", text);
  if (context) {
    body.set("context_type", context.type);
    body.set("context_id", context.id);
  }
  for (const file of files) body.append("files", file);
  return apiFetch<ChatTurn>(`${path}/with-files`, { method: "POST", body });
}

/**
 * Refresh after a reply: the sidebar's recent chats (in the root layout) changed, and
 * if the assistant changed CRM data, any page may show something new.
 */
function revalidateAfter(_turn: ChatTurn) {
  revalidatePath("/", "layout");
}

export async function startConversation(
  content: string,
  context: PageContext | null,
  attachments?: FormData,
): Promise<ActionResult<ChatTurn>> {
  const checked = checkMessage(content, attachments);
  if (!checked.ok) return checked;

  const result = await runAction(() => post(BASE, checked.text, context, checked.files));
  if (result.ok) revalidateAfter(result.data);
  return result;
}

/** The assistant acts as the current user (it may create tasks, log activities, etc.). */
export async function sendMessage(
  conversationId: string,
  content: string,
  context: PageContext | null,
  attachments?: FormData,
): Promise<ActionResult<ChatTurn>> {
  const checked = checkMessage(content, attachments);
  if (!checked.ok) return checked;

  const result = await runAction(() =>
    post(`${BASE}/${conversationId}/messages`, checked.text, context, checked.files),
  );
  if (result.ok) revalidateAfter(result.data);
  return result;
}

/** Speech to text for a voice message (`audio` entry). `text` is empty when nobody spoke. */
export async function transcribeRecording(
  formData: FormData,
): Promise<ActionResult<{ text: string }>> {
  const audio = formData.get("audio");
  if (!(audio instanceof File) || audio.size === 0) {
    return { ok: false, error: "The recording is empty", status: 422 };
  }
  if (audio.size > MAX_RECORDING_BYTES) {
    return { ok: false, error: "Recordings can be at most 10 MB", status: 413 };
  }
  const body = new FormData();
  body.set("audio", audio);
  return runAction(() =>
    apiFetch<{ text: string }>("/assistant/transcribe", { method: "POST", body }),
  );
}

export async function searchConversations(
  filters: ConversationFilters,
): Promise<ActionResult<Paginated<Conversation>>> {
  return runAction(() =>
    apiFetch<Paginated<Conversation>>(BASE, { query: { size: 50, ...filters } }),
  );
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<ActionResult<Conversation>> {
  const name = title.trim();
  if (!name) return { ok: false, error: "Give the chat a name", status: 422 };
  return updateConversation(id, { title: name.slice(0, 200) });
}

export async function setConversationArchived(
  id: string,
  archived: boolean,
): Promise<ActionResult<Conversation>> {
  return updateConversation(id, { is_archived: archived });
}

async function updateConversation(
  id: string,
  body: { title?: string; is_archived?: boolean },
): Promise<ActionResult<Conversation>> {
  const result = await runAction(() =>
    apiFetch<Conversation>(`${BASE}/${id}`, { method: "PATCH", body }),
  );
  if (result.ok) revalidateConversations();
  return result;
}

export async function deleteConversation(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`${BASE}/${id}`, { method: "DELETE" }));
  if (result.ok) revalidateConversations();
  return result;
}

/** Archive / restore / delete several of your own chats at once. */
export async function bulkConversations(
  ids: string[],
  action: BulkConversationAction,
): Promise<ActionResult<{ affected: number }>> {
  if (ids.length === 0) return { ok: false, error: "Select at least one chat", status: 422 };
  const result = await runAction(() =>
    apiFetch<{ affected: number }>(`${BASE}/bulk`, { method: "POST", body: { ids, action } }),
  );
  if (result.ok) revalidateConversations();
  return result;
}

function revalidateConversations() {
  revalidatePath("/", "layout"); // the sidebar's recent chats are in the root layout
}

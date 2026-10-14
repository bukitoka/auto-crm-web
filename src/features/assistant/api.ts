import "server-only";
import { apiFetch } from "@/lib/api-client";
import type { Paginated } from "@/lib/types";
import type { Conversation, ConversationDetail, ConversationFilters } from "./types";

export function listConversations(filters: ConversationFilters = {}) {
  return apiFetch<Paginated<Conversation>>("/assistant/conversations", {
    query: { size: 50, ...filters },
  });
}

export function getConversation(id: string) {
  return apiFetch<ConversationDetail>(`/assistant/conversations/${id}`);
}

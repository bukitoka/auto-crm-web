import type { UserRef } from "@/features/users/types";

export type EntityType = "contact" | "company" | "deal" | "task" | "activity";

/** The record the user is looking at, so "this contact" works in prompts. */
export type PageContext = {
  type: "contact" | "company" | "deal";
  id: string;
};

/** Something the assistant changed (shown as a link under its reply). */
export type AssistantAction = {
  kind: "created" | "updated" | "completed" | "logged" | "moved" | "sent" | "scored";
  entity: EntityType;
  entity_id: string;
  label: string;
  link_entity: EntityType | null;
  link_id: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions: AssistantAction[];
  /** Files the user attached (names only; the API keeps their text for the model). */
  attachments: { name: string }[];
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  is_archived: boolean;
  message_count: number;
  last_message_at: string;
  user_id: string;
  user: UserRef;
  created_at: string;
  updated_at: string;
};

export type ConversationDetail = Conversation & { messages: ChatMessage[] };

/** Result of sending a message: the updated conversation and the question + reply. */
export type ChatTurn = {
  conversation: Conversation;
  messages: ChatMessage[];
};

export type ConversationFilters = {
  page?: number;
  size?: number;
  search?: string;
  archived?: boolean;
  /** Admins only: everyone's conversations. */
  scope?: "mine" | "all";
  user_id?: string;
};

export type BulkConversationAction = "archive" | "unarchive" | "delete";

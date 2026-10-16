"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { toastResult } from "@/lib/toast-result";
import { cn } from "@/lib/utils";
import { sendMessage, startConversation } from "../actions";
import type { ChatMessage, ChatTurn, PageContext } from "../types";
import { AssistantMessage, AssistantThinking } from "./assistant-message";
import { Composer } from "./composer";

export type ChatThreadProps = {
  /** null = a new chat; the first message creates the conversation. */
  conversationId: string | null;
  initialMessages?: ChatMessage[];
  /** The record being viewed (only used by the header panel). */
  context?: PageContext | null;
  /** Admins looking at someone else's chat: no composer. */
  readOnly?: boolean;
  /** "page": the /assistant pages; "panel": the header side panel. */
  variant?: "page" | "panel";
  /** Shown instead of the message list while the chat is empty (gets the composer + send). */
  renderEmpty?: (
    composer: ReactNode,
    send: (text: string) => void,
    fill: (text: string) => void,
  ) => ReactNode;
  /** Called after each successful reply (e.g. to remember the new conversation id). */
  onTurn?: (turn: ChatTurn, messages: ChatMessage[]) => void;
  /** Called when a link under a reply is clicked (the panel closes itself). */
  onNavigate?: () => void;
};

/**
 * Render with `key={conversationId}` so switching chats starts from fresh state.
 * The user's message shows immediately; if sending fails it is removed and the text
 * goes back into the composer.
 */
export function ChatThread({
  conversationId,
  initialMessages = [],
  context = null,
  readOnly = false,
  variant = "page",
  renderEmpty,
  onTurn,
  onNavigate,
}: ChatThreadProps) {
  const router = useRouter();
  const [id, setId] = useState(conversationId);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isPending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll whenever the list changes
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, isPending]);

  function send(text: string) {
    const content = text.trim();
    if ((!content && files.length === 0) || isPending) return;
    const before = messages;
    const sentFiles = files;
    const optimistic: ChatMessage = {
      id: `pending-${Date.now()}`,
      role: "user",
      content,
      actions: [],
      attachments: sentFiles.map((file) => ({ name: file.name })),
      created_at: new Date().toISOString(),
    };
    setMessages([...before, optimistic]);
    setDraft("");
    setFiles([]);

    let attachments: FormData | undefined;
    if (sentFiles.length > 0) {
      attachments = new FormData();
      for (const file of sentFiles) attachments.append("files", file);
    }

    startTransition(async () => {
      const result = id
        ? await sendMessage(id, content, context, attachments)
        : await startConversation(content, context, attachments);
      if (!toastResult(result)) {
        setMessages(before);
        setDraft(content);
        setFiles(sentFiles);
        inputRef.current?.focus();
        return;
      }
      const next = [...before, ...result.data.messages];
      setMessages(next);
      setId(result.data.conversation.id);
      onTurn?.(result.data, next);
      if (result.data.messages.some((message) => message.actions.length > 0)) router.refresh();
    });
  }

  function fill(text: string) {
    setDraft(text);
    inputRef.current?.focus();
  }

  const isPanel = variant === "panel";
  const composer = readOnly ? null : (
    <Composer
      ref={inputRef}
      value={draft}
      onChange={setDraft}
      onSubmit={() => send(draft)}
      files={files}
      onFilesChange={setFiles}
      isPending={isPending}
      variant={messages.length === 0 && !isPanel ? "hero" : "compact"}
      autoFocus={!isPanel}
      hint={context ? <Badge variant="secondary">Using this {context.type}</Badge> : undefined}
    />
  );

  if (messages.length === 0 && renderEmpty) {
    return <>{renderEmpty(composer, send, fill)}</>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("min-h-0 flex-1 overflow-y-auto", isPanel ? "p-4" : "px-4 py-6")}>
        <div className={cn("mx-auto flex w-full flex-col gap-5", !isPanel && "max-w-3xl")}>
          {messages.map((message) => (
            <AssistantMessage
              key={message.id}
              role={message.role}
              content={message.content}
              actions={message.actions}
              attachments={message.attachments}
              onNavigate={onNavigate}
            />
          ))}
          {isPending ? <AssistantThinking /> : null}
          <div ref={endRef} />
        </div>
      </div>
      {composer ? (
        <div className={cn("border-t bg-background", isPanel ? "p-3" : "px-4 py-3")}>
          <div className={cn("mx-auto w-full", !isPanel && "max-w-3xl")}>{composer}</div>
        </div>
      ) : null}
    </div>
  );
}

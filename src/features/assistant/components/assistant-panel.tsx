"use client";

import { Maximize2, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { pageContextFromPath } from "../context";
import type { ChatMessage, PageContext } from "../types";
import { ChatThread } from "./chat-thread";

const STORAGE_KEY = "acrm-assistant-panel";

type PanelChat = { id: string | null; messages: ChatMessage[] };
const EMPTY: PanelChat = { id: null, messages: [] };

const SUGGESTIONS: Record<PageContext["type"] | "none", string[]> = {
  contact: [
    "Create a follow-up for this contact tomorrow",
    "Log a note: asked for pricing on today's call",
    "Summarize this contact and suggest next steps",
  ],
  company: ["Who are the contacts at this company?", "Create a deal for this company"],
  deal: ["Move this deal to Negotiation", "Add a task to send the contract by Friday"],
  none: ["Which of my tasks are overdue?", "How is my pipeline this month?"],
};

function loadChat(): PanelChat {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as PanelChat) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function saveChat(chat: PanelChat) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
  } catch {
    // Private mode / storage full: the panel just starts fresh next time.
  }
}

/**
 * Opened with ⌘J / Ctrl+J. Passes the record being viewed as context so "this contact"
 * works. The open chat is remembered per tab (sessionStorage).
 */
export function AssistantPanel() {
  const pathname = usePathname();
  const context = pageContextFromPath(pathname);
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<PanelChat>(EMPTY);
  // Remounts the thread: after restoring a saved chat, and on "New chat".
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const saved = loadChat();
    if (saved.id) {
      setChat(saved);
      setVersion((v) => v + 1);
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "j" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // The assistant pages already are the full chat.
  if (pathname.startsWith("/assistant")) return null;

  function newChat() {
    saveChat(EMPTY);
    setChat(EMPTY);
    setVersion((v) => v + 1);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5" title="AI assistant (⌘J)">
          <Sparkles className="text-primary" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </span>
            Assistant
          </SheetTitle>
          <SheetDescription>Ask or tell it what to do. Chats are saved.</SheetDescription>
          {chat.id ? (
            <div className="absolute top-3 right-12 flex gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/assistant/${chat.id}`} onClick={() => setOpen(false)}>
                  <Maximize2 />
                  Open
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={newChat}>
                <RotateCcw />
                New
              </Button>
            </div>
          ) : null}
        </SheetHeader>
        <ChatThread
          key={version}
          variant="panel"
          conversationId={chat.id}
          initialMessages={chat.messages}
          context={context}
          onNavigate={() => setOpen(false)}
          onTurn={(turn, messages) => {
            const next = { id: turn.conversation.id, messages };
            saveChat(next);
            setChat(next);
          }}
          renderEmpty={(composer, send) => (
            <div className="flex min-h-0 flex-1 flex-col justify-end gap-4 p-4">
              <p className="text-sm text-muted-foreground">
                Hi! I can look things up and do the busywork for you. Try:
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS[context?.type ?? "none"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-md border bg-card px-3 py-2 text-left text-sm transition-colors hover:border-primary/50 hover:bg-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              {composer}
            </div>
          )}
        />
      </SheetContent>
    </Sheet>
  );
}

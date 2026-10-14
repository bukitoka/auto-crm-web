"use client";

import { MessagesSquare, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelative } from "@/lib/format";
import { searchConversations } from "../actions";
import { groupByDate } from "../context";
import type { Conversation } from "../types";
import { ConversationMenu } from "./conversation-menu";

type ConversationListProps = {
  /** Your active conversations, loaded by the history page. */
  conversations: Conversation[];
};

/** The chat history page: search, Chats / Archived, grouped by date, each with a ⋯ menu. */
export function ConversationList({ conversations }: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [archived, setArchived] = useState(false);
  const [results, setResults] = useState<Conversation[] | null>(null);
  const [isSearching, startSearch] = useTransition();

  // The default view comes from the server; searching or "Archived" loads from the API.
  const filtering = archived || search.trim().length > 0;
  // biome-ignore lint/correctness/useExhaustiveDependencies: refetch when the server list changes too
  useEffect(() => {
    if (!filtering) {
      setResults(null);
      return;
    }
    const timer = setTimeout(() => {
      startSearch(async () => {
        const result = await searchConversations({ archived, search: search.trim() || undefined });
        if (result.ok) setResults(result.data.items);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [archived, search, filtering, conversations]);

  const shown = results ?? conversations;

  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs
          value={archived ? "archived" : "active"}
          onValueChange={(value) => setArchived(value === "archived")}
        >
          <TabsList>
            <TabsTrigger value="active">Chats</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        <InputGroup className="sm:ml-auto sm:max-w-xs">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search chats…"
            aria-label="Search chats"
          />
        </InputGroup>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title={archived ? "No archived chats" : search ? "No chats match" : "No chats yet"}
          description={
            archived ? "Archived chats show up here." : "Ask the assistant something to start one."
          }
        />
      ) : (
        <div className="flex flex-col gap-6" aria-busy={isSearching}>
          {groupByDate(shown).map((group) => (
            <section key={group.label} className="flex flex-col gap-2">
              <h2 className="text-xs font-medium text-muted-foreground">{group.label}</h2>
              <ul className="divide-y overflow-hidden rounded-lg border bg-card">
                {group.items.map((conversation) => (
                  <li
                    key={conversation.id}
                    className="flex items-center gap-2 pr-2 transition-colors hover:bg-muted/50"
                  >
                    <Link
                      href={`/assistant/${conversation.id}`}
                      className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3"
                    >
                      <span className="truncate text-sm font-medium">{conversation.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(conversation.last_message_at)} ·{" "}
                        {conversation.message_count} messages
                      </span>
                    </Link>
                    <ConversationMenu
                      conversation={conversation}
                      onRemoved={() =>
                        setResults((current) =>
                          (current ?? conversations).filter((c) => c.id !== conversation.id),
                        )
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

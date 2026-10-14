"use client";

import { Archive, ArchiveRestore, Eye, MessagesSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatRelative } from "@/lib/format";
import { toastResult } from "@/lib/toast-result";
import { bulkConversations } from "../actions";
import type { BulkConversationAction, Conversation } from "../types";

const DONE: Record<BulkConversationAction, string> = {
  archive: "Archived",
  unarchive: "Restored",
  delete: "Deleted",
};

/**
 * Admin view of everyone's AI chats: select rows (or use the row buttons) to archive,
 * restore or delete. "View" opens the chat read-only.
 */
export function ConversationsAdminTable({
  conversations,
  archived,
}: {
  conversations: Conversation[];
  archived: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);
  const [isPending, startTransition] = useTransition();

  const allSelected = conversations.length > 0 && selected.length === conversations.length;

  function run(ids: string[], action: BulkConversationAction) {
    startTransition(async () => {
      const result = await bulkConversations(ids, action);
      const count = result.ok ? result.data.affected : 0;
      if (!toastResult(result, `${DONE[action]} ${count} chat${count === 1 ? "" : "s"}`)) return;
      setSelected((current) => current.filter((id) => !ids.includes(id)));
      setConfirmIds(null);
    });
  }

  function toggle(id: string, checked: boolean) {
    setSelected((current) => (checked ? [...current, id] : current.filter((x) => x !== id)));
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title={archived ? "No archived chats" : "No chats yet"}
        description="Conversations with the AI assistant show up here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
          <span className="mr-auto text-sm font-medium">{selected.length} selected</span>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => run(selected, archived ? "unarchive" : "archive")}
          >
            {archived ? <ArchiveRestore /> : <Archive />}
            {archived ? "Restore" : "Archive"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => setConfirmIds(selected)}
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  aria-label="Select all"
                  checked={allSelected ? true : selected.length > 0 ? "indeterminate" : false}
                  onCheckedChange={(checked) =>
                    setSelected(checked === true ? conversations.map((c) => c.id) : [])
                  }
                />
              </TableHead>
              <TableHead>Chat</TableHead>
              <TableHead className="hidden md:table-cell">User</TableHead>
              <TableHead className="hidden sm:table-cell">Messages</TableHead>
              <TableHead className="hidden lg:table-cell">Last activity</TableHead>
              <TableHead className="w-0" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((conversation) => (
              <TableRow
                key={conversation.id}
                data-state={selected.includes(conversation.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${conversation.title}`}
                    checked={selected.includes(conversation.id)}
                    onCheckedChange={(checked) => toggle(conversation.id, checked === true)}
                  />
                </TableCell>
                <TableCell className="max-w-0 min-w-48">
                  <span className="block truncate font-medium">{conversation.title}</span>
                  {conversation.is_archived ? (
                    <Badge variant="secondary" className="mt-1">
                      Archived
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="flex items-center gap-2">
                    <EntityAvatar
                      name={conversation.user.full_name}
                      src={conversation.user.avatar_url}
                      className="size-7"
                      fallbackClassName="text-[0.6875rem]"
                    />
                    {conversation.user.full_name}
                  </span>
                </TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">
                  {conversation.message_count}
                </TableCell>
                <TableCell
                  className="hidden text-muted-foreground lg:table-cell"
                  title={formatDateTime(conversation.last_message_at)}
                >
                  {formatRelative(conversation.last_message_at)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild>
                      <Link
                        href={`/assistant/${conversation.id}`}
                        aria-label={`View ${conversation.title}`}
                      >
                        <Eye />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      aria-label={`${archived ? "Restore" : "Archive"} ${conversation.title}`}
                      onClick={() => run([conversation.id], archived ? "unarchive" : "archive")}
                    >
                      {archived ? <ArchiveRestore /> : <Archive />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      aria-label={`Delete ${conversation.title}`}
                      onClick={() => setConfirmIds([conversation.id])}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmIds !== null} onOpenChange={(open) => !open && setConfirmIds(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {confirmIds?.length === 1 ? "this chat" : `${confirmIds?.length} chats`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The messages are removed for good. Records the assistant created stay in the CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                if (confirmIds) run(confirmIds, "delete");
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import { Archive, ArchiveRestore, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { deleteConversation, renameConversation, setConversationArchived } from "../actions";
import type { Conversation } from "../types";

type ConversationMenuProps = {
  conversation: Conversation;
  /** The "⋯" button; defaults to a small ghost icon button. */
  trigger?: ReactNode;
  /** Called after archive/restore/delete (the chat leaves the current list). */
  onRemoved?: () => void;
  align?: "start" | "end";
  side?: "right" | "bottom";
};

/** Archiving or deleting the chat that is currently open navigates back to /assistant. */
export function ConversationMenu({
  conversation,
  trigger,
  onRemoved,
  align = "end",
  side = "bottom",
}: ConversationMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const [isPending, startTransition] = useTransition();
  const isOpenChat = pathname === `/assistant/${conversation.id}`;

  function leaveIfOpen() {
    onRemoved?.();
    if (isOpenChat) router.push("/assistant");
  }

  function rename(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      if (!toastResult(await renameConversation(conversation.id, title), "Chat renamed")) return;
      setRenaming(false);
      router.refresh();
    });
  }

  function toggleArchived() {
    const archive = !conversation.is_archived;
    startTransition(async () => {
      const result = await setConversationArchived(conversation.id, archive);
      if (!toastResult(result, archive ? "Chat archived" : "Chat restored")) return;
      leaveIfOpen();
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      if (!toastResult(await deleteConversation(conversation.id), "Chat deleted")) return;
      setDeleting(false);
      leaveIfOpen();
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger ?? (
            <Button variant="ghost" size="icon-xs" aria-label={`Options for ${conversation.title}`}>
              <MoreHorizontal />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-44">
          <DropdownMenuItem
            onSelect={() => {
              setTitle(conversation.title);
              setRenaming(true);
            }}
          >
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleArchived}>
            {conversation.is_archived ? <ArchiveRestore /> : <Archive />}
            {conversation.is_archived ? "Restore" : "Archive"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renaming} onOpenChange={setRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
            <DialogDescription>Give it a name you'll recognise later.</DialogDescription>
          </DialogHeader>
          <form id={`rename-${conversation.id}`} onSubmit={rename}>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-label="Chat name"
              maxLength={200}
              autoFocus
            />
          </form>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setRenaming(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={`rename-${conversation.id}`}
              disabled={isPending || !title.trim()}
            >
              {isPending ? <Spinner /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting} onOpenChange={setDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
            <AlertDialogDescription>
              “{conversation.title}” and its messages will be removed. Records the assistant created
              stay in the CRM.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

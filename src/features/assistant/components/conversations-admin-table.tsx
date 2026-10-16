import { Eye, MessagesSquare } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatRelative } from "@/lib/format";
import type { Conversation } from "../types";

/** Read-only list of every admin's chats; the API blocks the super admin from changing them. */
export function ConversationsAdminTable({
  conversations,
  archived,
}: {
  conversations: Conversation[];
  archived: boolean;
}) {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title={archived ? "No archived chats" : "No chats yet"}
        description="Conversations admins have with the assistant show up here."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chat</TableHead>
            <TableHead className="hidden md:table-cell">Admin</TableHead>
            <TableHead className="hidden sm:table-cell">Messages</TableHead>
            <TableHead className="hidden lg:table-cell">Last activity</TableHead>
            <TableHead className="w-0" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {conversations.map((conversation) => (
            <TableRow key={conversation.id}>
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
                <div className="flex justify-end">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link
                      href={`/assistant/${conversation.id}`}
                      aria-label={`View ${conversation.title}`}
                    >
                      <Eye />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

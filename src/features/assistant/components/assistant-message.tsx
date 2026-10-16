import {
  ArrowUpRight,
  CircleCheck,
  FilePen,
  Gauge,
  ListPlus,
  type LucideIcon,
  MessageSquareText,
  MoveRight,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { actionHref } from "../context";
import type { AssistantAction, ChatMessage } from "../types";
import { AttachmentChip } from "./attachment-chip";

const ACTION_ICONS: Record<AssistantAction["kind"], LucideIcon> = {
  created: ListPlus,
  updated: FilePen,
  completed: CircleCheck,
  logged: MessageSquareText,
  moved: MoveRight,
  sent: Send,
  scored: Gauge,
};

function ActionLink({ action, onNavigate }: { action: AssistantAction; onNavigate?: () => void }) {
  const Icon = ACTION_ICONS[action.kind];
  return (
    <Link
      href={actionHref(action)}
      onClick={onNavigate}
      className="group flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs transition-colors hover:border-primary/50"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{action.label}</span>
      <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}

type MessageProps = {
  role: "user" | "assistant";
  content: string;
  actions?: AssistantAction[];
  attachments?: ChatMessage["attachments"];
  onNavigate?: () => void;
};

/** Assistant replies link to the records they changed; user messages list their files. */
export function AssistantMessage({
  role,
  content,
  actions = [],
  attachments = [],
  onNavigate,
}: MessageProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser && "justify-end")}>
      {isUser ? null : (
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-3.5" />
        </span>
      )}
      <div className={cn("flex max-w-[85%] min-w-0 flex-col gap-2", isUser && "items-end")}>
        {attachments.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-1.5">
            {attachments.map((file) => (
              <AttachmentChip key={file.name} name={file.name} />
            ))}
          </div>
        ) : null}
        {content ? (
          <div
            className={cn(
              "rounded-lg px-3.5 py-2.5 text-sm break-words whitespace-pre-wrap",
              isUser
                ? "rounded-br-sm bg-primary text-primary-foreground"
                : "rounded-tl-sm bg-muted text-foreground",
            )}
          >
            {content}
          </div>
        ) : null}
        {actions.length > 0 ? (
          <div className="flex w-full flex-col gap-1.5">
            {actions.map((action) => (
              <ActionLink
                key={`${action.kind}-${action.entity_id}`}
                action={action}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function AssistantThinking() {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="size-3.5 animate-pulse" />
      </span>
      Working on it…
    </div>
  );
}

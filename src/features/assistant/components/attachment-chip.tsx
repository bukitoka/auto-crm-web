import { Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** A file attached to a message: in the composer (removable) and on sent messages. */
export function AttachmentChip({ name, onRemove }: { name: string; onRemove?: () => void }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-60 items-center gap-1.5 rounded-full border bg-card py-1 pr-2.5 pl-2 text-xs text-foreground",
        onRemove && "pr-1",
      )}
    >
      <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{name}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { forwardRef, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CAPTURE_ACCEPT, MAX_ATTACHMENTS, MAX_UPLOAD_BYTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { AttachmentChip } from "./attachment-chip";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Attached files (photos, PDFs, Word, emails, text): the API reads their text. */
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  isPending?: boolean;
  placeholder?: string;
  /** "hero": the big box on the assistant home; "compact": under a conversation. */
  variant?: "hero" | "compact";
  /** Shown above the box, e.g. "Using this contact". */
  hint?: React.ReactNode;
  autoFocus?: boolean;
};

/** Enter sends, Shift+Enter starts a new line. */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    value,
    onChange,
    onSubmit,
    files = [],
    onFilesChange,
    isPending = false,
    placeholder = "Ask or tell the assistant…",
    variant = "compact",
    hint,
    autoFocus,
  },
  ref,
) {
  const hero = variant === "hero";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canSend = !isPending && (value.trim().length > 0 || files.length > 0);

  function addFiles(added: FileList | File[]) {
    if (!onFilesChange) return;
    const fitting = Array.from(added).filter((file) => {
      if (file.size <= MAX_UPLOAD_BYTES) return true;
      toast.error(`${file.name} is larger than 5 MB`);
      return false;
    });
    const next = [...files, ...fitting];
    if (next.length > MAX_ATTACHMENTS) toast.error(`Attach at most ${MAX_ATTACHMENTS} files`);
    onFilesChange(next.slice(0, MAX_ATTACHMENTS));
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (canSend) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSend) onSubmit();
      }}
      onDragOver={(event) => {
        if (!onFilesChange || !event.dataTransfer.types.includes("Files")) return;
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        if (!onFilesChange) return;
        event.preventDefault();
        setIsDragging(false);
        addFiles(event.dataTransfer.files);
      }}
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card transition-colors focus-within:border-primary/60",
        hero ? "p-3 ring-4 ring-primary/5 focus-within:ring-primary/10" : "p-2",
        isDragging && "border-primary bg-accent",
      )}
    >
      {hint ? <div className="px-1">{hint}</div> : null}
      {files.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 px-1">
          {files.map((file) => (
            <AttachmentChip
              key={`${file.name}-${file.size}-${file.lastModified}`}
              name={file.name}
              onRemove={
                isPending ? undefined : () => onFilesChange?.(files.filter((f) => f !== file))
              }
            />
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-1">
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={(event) => {
            if (!onFilesChange || event.clipboardData.files.length === 0) return;
            event.preventDefault(); // a pasted screenshot becomes an attachment
            addFiles(event.clipboardData.files);
          }}
          placeholder={placeholder}
          aria-label="Message the assistant"
          maxLength={4000}
          rows={hero ? 3 : 1}
          // biome-ignore lint/a11y/noAutofocus: the composer is the point of the page
          autoFocus={autoFocus}
          className={cn(
            "field-sizing-content max-h-48 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 outline-none placeholder:text-muted-foreground",
            hero ? "min-h-20 text-base" : "min-h-9 text-sm",
          )}
        />
        {onFilesChange ? (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Attach files"
              disabled={isPending || files.length >= MAX_ATTACHMENTS}
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0"
            >
              <Paperclip />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={CAPTURE_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-label="Attach files to the message"
              onChange={(event) => {
                if (event.target.files) addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </>
        ) : null}
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={!canSend}
          className="ml-1 shrink-0"
        >
          {isPending ? <Spinner /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
});

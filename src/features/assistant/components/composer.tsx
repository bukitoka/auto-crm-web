"use client";

import { ArrowUp } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending?: boolean;
  placeholder?: string;
  /** "hero": the big box on the assistant home; "compact": under a conversation. */
  variant?: "hero" | "compact";
  /** Shown above the box, e.g. "Using this contact". */
  hint?: React.ReactNode;
  autoFocus?: boolean;
};

/** The message box. Enter sends, Shift+Enter starts a new line. */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    value,
    onChange,
    onSubmit,
    isPending = false,
    placeholder = "Ask or tell the assistant…",
    variant = "compact",
    hint,
    autoFocus,
  },
  ref,
) {
  const hero = variant === "hero";

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      if (!isPending && value.trim()) onSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isPending && value.trim()) onSubmit();
      }}
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card transition-colors focus-within:border-primary/60",
        hero ? "p-3 ring-4 ring-primary/5 focus-within:ring-primary/10" : "p-2",
      )}
    >
      {hint ? <div className="px-1">{hint}</div> : null}
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
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
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={isPending || !value.trim()}
          className="shrink-0"
        >
          {isPending ? <Spinner /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
});

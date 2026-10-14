"use client";

import { ListChecks, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { summarizeTimeline } from "../actions";
import type { TimelineSummary as Summary } from "../types";

/** "Summarize timeline" action: AI summary + suggested next actions. */
export function TimelineSummary({ contactId, dealId }: { contactId?: string; dealId?: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSummarize() {
    startTransition(async () => {
      const result = await summarizeTimeline({ contactId, dealId });
      if (toastResult(result)) setSummary(result.data);
    });
  }

  return (
    <div className="space-y-3">
      <Button size="sm" variant="outline" onClick={handleSummarize} disabled={isPending}>
        {isPending ? <Spinner /> : <Sparkles />}
        {isPending ? "Summarizing…" : "Summarize timeline"}
      </Button>
      {summary ? (
        <div className="space-y-3 rounded-md border border-primary/20 bg-accent/60 p-4 text-sm">
          <p className="whitespace-pre-line">{summary.summary}</p>
          {summary.next_actions.length > 0 ? (
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 font-medium">
                <ListChecks className="size-4" /> Suggested next actions
              </p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {summary.next_actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { formatRelative } from "@/lib/format";
import { toastResult } from "@/lib/toast-result";
import { scoreContact } from "../actions";

type AiScoreCardProps = {
  contactId: string;
  score: number | null;
  reasoning: string | null;
  scoredAt: string | null;
  readOnly?: boolean;
};

export function AiScoreCard({
  contactId,
  score,
  reasoning,
  scoredAt,
  readOnly = false,
}: AiScoreCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleScore() {
    startTransition(async () => {
      const result = await scoreContact(contactId);
      toastResult(result, "Lead scored");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          AI lead score
        </CardTitle>
        <CardDescription>
          {scoredAt ? `Scored ${formatRelative(scoredAt)}` : "Not scored yet"}
        </CardDescription>
        {readOnly ? null : (
          <CardAction>
            <Button size="sm" variant="outline" onClick={handleScore} disabled={isPending}>
              {isPending ? <Spinner /> : <Sparkles />}
              {score === null ? "Score with AI" : "Re-score"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isPending ? (
          <p className="text-sm text-muted-foreground">
            Analyzing profile, deals and activities… this can take a few seconds.
          </p>
        ) : score === null ? (
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? "The admin who owns this contact has not scored it."
              : "Let AI rate how likely this lead is to convert, based on profile, deals and activity."}
          </p>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold tabular-nums">{score}</span>
              <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
            </div>
            <Progress value={score} aria-label="Lead score" />
            {reasoning ? (
              <p className="text-sm whitespace-pre-line text-muted-foreground">{reasoning}</p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

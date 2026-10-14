import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

/** Hot leads (≥ 70) are green, warm (≥ 40) amber, cold muted. */
export function scoreVariant(score: number): BadgeVariant {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "secondary";
}

export function AiScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <Badge variant={scoreVariant(score)} className="tabular-nums">
      <Sparkles data-icon="inline-start" />
      {score}
    </Badge>
  );
}

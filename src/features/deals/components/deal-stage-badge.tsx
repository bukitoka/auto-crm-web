import { Badge } from "@/components/ui/badge";
import type { StageRef } from "../types";

export function DealStageBadge({ stage }: { stage: StageRef }) {
  if (stage.is_won) return <Badge variant="success">{stage.name}</Badge>;
  if (stage.is_lost) return <Badge variant="destructive">{stage.name}</Badge>;
  return <Badge variant="secondary">{stage.name}</Badge>;
}

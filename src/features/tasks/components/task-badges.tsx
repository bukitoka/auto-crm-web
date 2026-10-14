import { Badge } from "@/components/ui/badge";
import type { TaskPriority, TaskStatus } from "../types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const priorityVariants: Record<TaskPriority, BadgeVariant> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
};

const statusVariants: Record<TaskStatus, BadgeVariant> = {
  todo: "outline",
  in_progress: "info",
  done: "success",
};

const statusLabels: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge variant={priorityVariants[priority]} className="capitalize">
      {priority}
    </Badge>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>;
}

export const taskStatusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value,
  label,
}));

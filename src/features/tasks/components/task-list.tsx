import Link from "next/link";
import { formatDate, isOverdue, personName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "../types";
import { CompleteTaskButton } from "./complete-task-button";
import { TaskPriorityBadge } from "./task-badges";

/** Compact task list for the dashboard and detail pages. */
export function TaskList({
  tasks,
  emptyText = "No tasks.",
}: {
  tasks: Task[];
  emptyText?: string;
}) {
  if (tasks.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="divide-y">
      {tasks.map((task) => {
        const overdue = task.status !== "done" && isOverdue(task.due_date);
        return (
          <li key={task.id} className="flex items-center gap-3 py-2.5">
            <CompleteTaskButton taskId={task.id} status={task.status} />
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  task.status === "done" && "text-muted-foreground line-through",
                )}
              >
                {task.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                <span className={cn(overdue && "font-medium text-destructive")}>
                  {task.due_date ? `Due ${formatDate(task.due_date)}` : "No due date"}
                </span>
                {task.contact ? (
                  <>
                    {" · "}
                    <Link href={`/contacts/${task.contact.id}`} className="hover:underline">
                      {personName(task.contact)}
                    </Link>
                  </>
                ) : null}
                {task.deal ? (
                  <>
                    {" · "}
                    <Link href={`/deals/${task.deal.id}`} className="hover:underline">
                      {task.deal.title}
                    </Link>
                  </>
                ) : null}
              </p>
            </div>
            <TaskPriorityBadge priority={task.priority} />
          </li>
        );
      })}
    </ul>
  );
}

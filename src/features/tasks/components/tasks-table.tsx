import { CheckSquare, Pencil } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, isOverdue, personName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { deleteTask } from "../actions";
import type { Task } from "../types";
import { CompleteTaskButton } from "./complete-task-button";
import { TaskPriorityBadge, TaskStatusBadge } from "./task-badges";
import type { TaskFormOptions } from "./task-form";
import { TaskFormDialog } from "./task-form-dialog";

export function TasksTable({ tasks, options }: { tasks: Task[]; options: TaskFormOptions }) {
  if (tasks.length === 0) {
    return (
      <EmptyState icon={CheckSquare} title="No tasks found" description="You're all caught up." />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <span className="sr-only">Complete</span>
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="hidden sm:table-cell">Priority</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden lg:table-cell">Assignee</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const overdue = task.status !== "done" && isOverdue(task.due_date);
            return (
              <TableRow key={task.id}>
                <TableCell>
                  <CompleteTaskButton taskId={task.id} status={task.status} />
                </TableCell>
                <TableCell className="max-w-xs">
                  <p
                    className={cn(
                      "truncate font-medium",
                      task.status === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {task.contact ? (
                      <Link href={`/contacts/${task.contact.id}`} className="hover:underline">
                        {personName(task.contact)}
                      </Link>
                    ) : null}
                    {task.contact && task.deal ? " · " : null}
                    {task.deal ? (
                      <Link href={`/deals/${task.deal.id}`} className="hover:underline">
                        {task.deal.title}
                      </Link>
                    ) : null}
                  </p>
                </TableCell>
                <TableCell className={cn(overdue && "font-medium text-destructive")}>
                  {formatDate(task.due_date)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <TaskPriorityBadge priority={task.priority} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <TaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {task.assignee?.full_name ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <TaskFormDialog
                      task={task}
                      {...options}
                      trigger={
                        <Button variant="ghost" size="icon-sm" aria-label="Edit task">
                          <Pencil />
                        </Button>
                      }
                    />
                    <ConfirmDeleteButton
                      title={`Delete "${task.title}"?`}
                      action={deleteTask.bind(null, task.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

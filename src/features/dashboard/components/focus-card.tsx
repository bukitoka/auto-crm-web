import { ArrowRight, CalendarDays, CircleCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/features/tasks/components/task-list"
import { cn } from "@/lib/utils"
import type { DashboardSummary } from "../types"

export function FocusCard({
  summary,
  oversight,
}: {
  summary: DashboardSummary
  oversight: boolean
}) {
  const hasOverdue = summary.overdue_tasks > 0
  const preview = summary.overdue_task_list.slice(0, 3)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays aria-hidden className="size-4 text-primary" />
          <h2>Today’s focus</h2>
        </CardTitle>
        <CardDescription>
          {oversight ? "Follow-ups across your team" : "A quick check on your follow-ups"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <dl className="grid grid-cols-3 divide-x rounded-md border bg-muted/30 py-3">
          <div className="flex flex-col px-3">
            <dt className="order-last mt-1 text-xs text-muted-foreground">Overdue</dt>
            <dd
              className={cn(
                "text-2xl font-semibold tabular-nums",
                hasOverdue && "text-destructive",
              )}
            >
              {summary.overdue_tasks}
            </dd>
          </div>
          <div className="flex flex-col px-3">
            <dt className="order-last mt-1 text-xs text-muted-foreground">Due today</dt>
            <dd className="text-2xl font-semibold tabular-nums">{summary.tasks_due_today}</dd>
          </div>
          <div className="flex flex-col px-3">
            <dt className="order-last mt-1 text-xs text-muted-foreground">This week</dt>
            <dd className="text-2xl font-semibold tabular-nums">{summary.tasks_due_this_week}</dd>
          </div>
        </dl>
        {hasOverdue ? (
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Start with the oldest follow-ups
            </p>
            <TaskList
              tasks={preview}
              showAssignee={oversight}
              readOnly={oversight}
              emptyText="Open your tasks to review overdue follow-ups."
            />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-start justify-center gap-2 py-3">
            <CircleCheck aria-hidden className="size-6 text-success" />
            <p className="font-medium">
              {oversight ? "Your team has no overdue tasks." : "You’re caught up on overdue tasks."}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Take a look at what’s coming up and plan your next follow-up.
            </p>
          </div>
        )}
        <Button variant={hasOverdue ? "default" : "outline"} asChild className="mt-auto w-full">
          <Link href={hasOverdue ? "/tasks?overdue=true" : "/tasks"}>
            {hasOverdue
              ? "Review overdue tasks"
              : oversight
                ? "View team tasks"
                : "Plan my next follow-up"}
            <ArrowRight aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

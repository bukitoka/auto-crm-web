import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/features/auth/api"
import { listContactOptions } from "@/features/contacts/api"
import { listDealOptions } from "@/features/deals/api"
import { CompleteTaskButton } from "@/features/tasks/components/complete-task-button"
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog"
import { canWriteCrm } from "@/features/users/roles"
import { apiFetch } from "@/lib/api-client"
import { formatDate, formatDateTime } from "@/lib/format"

export const metadata: Metadata = { title: "Follow-ups" }

const groups = {
  task: "Overdue tasks",
  deal: "Deals closing soon without a scheduled next step",
  lead: "Leads awaiting first contact",
} as const

type FollowUp = {
  kind: keyof typeof groups
  id: string
  title: string
  due_date: string | null
  contact_id: string | null
  response_due_at?: string | null
  response_overdue?: boolean
}

export default async function FollowUpsPage() {
  const [user, items] = await Promise.all([
    getCurrentUser(),
    apiFetch<FollowUp[]>("/dashboard/follow-ups"),
  ])
  const canWrite = canWriteCrm(user)
  const [contacts, deals] = canWrite
    ? await Promise.all([listContactOptions(), listDealOptions()])
    : [[], []]

  return (
    <>
      <PageHeader
        title="Follow-up inbox"
        description="Overdue work and records that need a next step."
      />
      {Object.entries(groups).map(([kind, title]) => {
        const group = items.filter((item) => item.kind === kind)
        return (
          <Card key={kind}>
            <CardHeader>
              <CardTitle>
                <h2>{title}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.length === 0 ? (
                <p className="text-muted-foreground">Nothing to review here.</p>
              ) : (
                <ul className="divide-y">
                  {group.map((item) => (
                    <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                      {canWrite && item.kind === "task" ? (
                        <CompleteTaskButton taskId={item.id} status="todo" />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <Link
                          className="break-words font-medium hover:underline"
                          href={
                            item.kind === "task"
                              ? `/tasks?overdue=true&search=${encodeURIComponent(item.title)}`
                              : item.kind === "deal"
                                ? `/deals/${item.id}`
                                : `/contacts/${item.id}`
                          }
                        >
                          {item.title}
                        </Link>
                        {item.due_date ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(item.due_date)}
                          </p>
                        ) : null}
                        {item.response_due_at ? (
                          <p
                            className={
                              item.response_overdue
                                ? "text-xs font-medium text-destructive"
                                : "text-xs text-muted-foreground"
                            }
                          >
                            {item.response_overdue
                              ? "Response target missed"
                              : "First response due"}{" "}
                            · {formatDateTime(item.response_due_at)}
                          </p>
                        ) : null}
                      </div>
                      {item.contact_id ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/contacts/${item.contact_id}/call-prep`}>Call prep</Link>
                        </Button>
                      ) : null}
                      {canWrite && item.kind !== "task" ? (
                        <TaskFormDialog
                          contacts={contacts}
                          deals={deals}
                          initialValues={{
                            title: `Follow up: ${item.title}`.slice(0, 200),
                            contact_id: item.contact_id ?? "",
                            deal_id: item.kind === "deal" ? item.id : "",
                          }}
                          trigger={
                            <Button variant="outline" size="sm">
                              Schedule task
                            </Button>
                          }
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}

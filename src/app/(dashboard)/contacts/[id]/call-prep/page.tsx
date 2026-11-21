import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { listActivities } from "@/features/activities/api"
import { getCurrentUser } from "@/features/auth/api"
import { getContact } from "@/features/contacts/api"
import { listDeals } from "@/features/deals/api"
import { DealList } from "@/features/deals/components/deal-list"
import { ComposeEmailDialog } from "@/features/emails/components/compose-email-dialog"
import { listTasks } from "@/features/tasks/api"
import { TaskList } from "@/features/tasks/components/task-list"
import { canWriteCrm } from "@/features/users/roles"
import { ApiError } from "@/lib/api-client"
import { formatDateTime, personName } from "@/lib/format"

export const metadata: Metadata = { title: "Call prep" }

export default async function CallPrepPage({ params }: PageProps<"/contacts/[id]/call-prep">) {
  const { id } = await params
  const contact = await getContact(id).catch((error: unknown) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound()
    throw error
  })
  const [user, recent, todo, inProgress, deals] = await Promise.all([
    getCurrentUser(),
    listActivities({ contact_id: id, size: 1 }),
    listTasks({ contact_id: id, status: "todo", page: 1, size: 50 }),
    listTasks({ contact_id: id, status: "in_progress", page: 1, size: 50 }),
    listDeals({ contact_id: id, page: 1, size: 50 }),
  ])
  const name = personName(contact)
  const latest = recent.items[0]
  const openDeals = deals.items.filter((deal) => !deal.stage.is_won && !deal.stage.is_lost)

  return (
    <>
      <PageHeader
        title={`Call prep · ${name}`}
        description={
          [contact.company?.name, contact.phone, contact.email].filter(Boolean).join(" · ") ||
          undefined
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/contacts/${id}`}>Open contact</Link>
            </Button>
            {contact.phone ? (
              <Button asChild variant="outline">
                <a href={`tel:${contact.phone}`}>Call</a>
              </Button>
            ) : null}
            {canWriteCrm(user) && contact.email ? (
              <ComposeEmailDialog
                recipients={[{ id, name, email: contact.email }]}
                contactId={id}
                deals={openDeals.map(({ id: dealId, title }) => ({ id: dealId, title }))}
              />
            ) : null}
          </>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Last logged activity</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {latest ? (
            <>
              <Link
                href={`/contacts/${id}#activity-${latest.id}`}
                className="font-medium text-primary hover:underline"
              >
                {latest.subject || latest.type}
              </Link>
              <p className="text-sm text-muted-foreground">{formatDateTime(latest.occurred_at)}</p>
              {latest.body ? (
                <p className="wrap-break-word whitespace-pre-wrap">{latest.body}</p>
              ) : null}
            </>
          ) : (
            <p className="text-muted-foreground">No activity logged for this contact.</p>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Open commitments</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={[...todo.items, ...inProgress.items]} readOnly={!canWriteCrm(user)} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Open deals</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DealList deals={openDeals} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

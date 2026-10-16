import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listActivities } from "@/features/activities/api";
import { ActivityList } from "@/features/activities/components/activity-list";
import { AddActivityForm } from "@/features/activities/components/add-activity-form";
import { TimelineSummary } from "@/features/ai/components/timeline-summary";
import { listCompanyOptions } from "@/features/companies/api";
import { listContactOptions } from "@/features/contacts/api";
import { deleteDeal } from "@/features/deals/actions";
import { getDeal, listStages } from "@/features/deals/api";
import { DealFormDialog } from "@/features/deals/components/deal-form-dialog";
import { DealStageBadge } from "@/features/deals/components/deal-stage-badge";
import { MoveStageSelect } from "@/features/deals/components/move-stage-select";
import { ComposeEmailDialog } from "@/features/emails/components/compose-email-dialog";
import { listTasks } from "@/features/tasks/api";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskList } from "@/features/tasks/components/task-list";
import { listUserOptions } from "@/features/users/api";
import { ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate, personName } from "@/lib/format";

async function loadDeal(id: string) {
  try {
    return await getDeal(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/deals/[id]">): Promise<Metadata> {
  const { id } = await params;
  const deal = await loadDeal(id);
  return { title: deal.title };
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{children}</span>
    </div>
  );
}

export default async function DealDetailPage({ params }: PageProps<"/deals/[id]">) {
  const { id } = await params;
  const deal = await loadDeal(id);
  const [activities, tasks, stages, companies, contacts, users] = await Promise.all([
    listActivities({ deal_id: id }),
    listTasks({ page: 1, size: 50, deal_id: id }),
    listStages(),
    listCompanyOptions(),
    listContactOptions(),
    listUserOptions(),
  ]);

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {deal.title}
            <DealStageBadge stage={deal.stage} />
          </span>
        }
        description={formatCurrency(deal.value, deal.currency)}
        actions={
          <>
            <ComposeEmailDialog
              recipients={contacts.map((c) => ({ id: c.id, name: personName(c) }))}
              contactId={deal.contact_id ?? undefined}
              deals={[{ id: deal.id, title: deal.title }]}
              dealId={deal.id}
            />
            <DealFormDialog
              deal={deal}
              stages={stages}
              companies={companies}
              contacts={contacts}
              users={users}
              trigger={
                <Button variant="outline">
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <ConfirmDeleteButton
              variant="button"
              title={`Delete "${deal.title}"?`}
              action={deleteDeal.bind(null, deal.id)}
              redirectTo="/deals"
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-sm text-muted-foreground">Stage</span>
                <MoveStageSelect dealId={deal.id} stageId={deal.stage_id} stages={stages} />
              </div>
              <Detail label="Value">{formatCurrency(deal.value, deal.currency)}</Detail>
              <Detail label="Contact">
                {deal.contact ? (
                  <Link href={`/contacts/${deal.contact.id}`} className="hover:underline">
                    {personName(deal.contact)}
                  </Link>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="Company">
                {deal.company ? (
                  <Link href={`/companies/${deal.company.id}`} className="hover:underline">
                    {deal.company.name}
                  </Link>
                ) : (
                  "—"
                )}
              </Detail>
              <Detail label="Owner">{deal.owner?.full_name ?? "—"}</Detail>
              <Detail label="Expected close">{formatDate(deal.expected_close_date)}</Detail>
              {deal.closed_at ? <Detail label="Closed">{formatDate(deal.closed_at)}</Detail> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardAction>
                <TaskFormDialog
                  users={users}
                  contacts={contacts}
                  deals={[{ id: deal.id, title: deal.title }]}
                  initialValues={{ deal_id: deal.id, contact_id: deal.contact_id ?? "" }}
                  trigger={
                    <Button size="sm" variant="ghost">
                      <Plus />
                      Add
                    </Button>
                  }
                />
              </CardAction>
            </CardHeader>
            <CardContent>
              <TaskList tasks={tasks.items} />
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Everything that happened on this deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AddActivityForm dealId={deal.id} contactId={deal.contact_id ?? undefined} />
            <TimelineSummary dealId={deal.id} />
            <ActivityList activities={activities.items} canDelete />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

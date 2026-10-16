import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
import { AiScoreCard } from "@/features/ai/components/ai-score-card";
import { TimelineSummary } from "@/features/ai/components/timeline-summary";
import { listCompanyOptions } from "@/features/companies/api";
import { deleteContact } from "@/features/contacts/actions";
import { getContact } from "@/features/contacts/api";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ContactProfileCard } from "@/features/contacts/components/contact-profile-card";
import { ContactStatusBadge } from "@/features/contacts/components/contact-status-badge";
import { listDeals, listStages } from "@/features/deals/api";
import { DealFormDialog } from "@/features/deals/components/deal-form-dialog";
import { DealList } from "@/features/deals/components/deal-list";
import { ComposeEmailDialog } from "@/features/emails/components/compose-email-dialog";
import { listTasks } from "@/features/tasks/api";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TaskList } from "@/features/tasks/components/task-list";
import { listUserOptions } from "@/features/users/api";
import { ApiError } from "@/lib/api-client";
import { personName } from "@/lib/format";

async function loadContact(id: string) {
  try {
    return await getContact(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const { id } = await params;
  const contact = await loadContact(id);
  return { title: personName(contact) };
}

export default async function ContactDetailPage({ params }: PageProps<"/contacts/[id]">) {
  const { id } = await params;
  const contact = await loadContact(id);
  const [activities, deals, tasks, companies, users, stages] = await Promise.all([
    listActivities({ contact_id: id }),
    listDeals({ page: 1, size: 50, contact_id: id }),
    listTasks({ page: 1, size: 50, contact_id: id }),
    listCompanyOptions(),
    listUserOptions(),
    listStages(),
  ]);
  const name = personName(contact);

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {name}
            <ContactStatusBadge status={contact.status} />
          </span>
        }
        description={
          [contact.job_title, contact.company?.name].filter(Boolean).join(" · ") || undefined
        }
        actions={
          <>
            <ComposeEmailDialog
              recipients={[{ id: contact.id, name, email: contact.email }]}
              contactId={contact.id}
              deals={deals.items.map(({ id, title }) => ({ id, title }))}
            />
            <ContactFormDialog
              contact={contact}
              companies={companies}
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
              title={`Delete ${name}?`}
              description="The contact and its activities will be removed."
              action={deleteContact.bind(null, contact.id)}
              redirectTo="/contacts"
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <ContactProfileCard contact={contact} />
          <AiScoreCard
            contactId={contact.id}
            score={contact.ai_score}
            reasoning={contact.ai_summary}
            scoredAt={contact.ai_scored_at}
          />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Notes, calls, emails and meetings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AddActivityForm contactId={contact.id} />
              <TimelineSummary contactId={contact.id} />
              <ActivityList activities={activities.items} canDelete />
            </CardContent>
          </Card>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deals</CardTitle>
                <CardAction>
                  <DealFormDialog
                    stages={stages}
                    companies={companies}
                    contacts={[
                      {
                        id: contact.id,
                        first_name: contact.first_name,
                        last_name: contact.last_name,
                      },
                    ]}
                    users={users}
                    initialValues={{ contact_id: contact.id, company_id: contact.company_id ?? "" }}
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
                <DealList deals={deals.items} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardAction>
                  <TaskFormDialog
                    users={users}
                    contacts={[
                      {
                        id: contact.id,
                        first_name: contact.first_name,
                        last_name: contact.last_name,
                      },
                    ]}
                    deals={deals.items.map(({ id, title }) => ({ id, title }))}
                    initialValues={{ contact_id: contact.id }}
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
        </div>
      </div>
    </>
  );
}

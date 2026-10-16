import { Plus, ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/api";
import { listWebhookEvents, listWebhooks } from "@/features/automations/api";
import { N8nGuide } from "@/features/automations/components/n8n-guide";
import { WebhookFormDialog } from "@/features/automations/components/webhook-form-dialog";
import { WebhooksTable } from "@/features/automations/components/webhooks-table";
import { isAdmin } from "@/features/users/roles";

export const metadata: Metadata = { title: "Automations" };

export default async function AutomationsPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="Ask a workspace admin to manage automations."
      />
    );
  }

  const [webhooks, events] = await Promise.all([listWebhooks(), listWebhookEvents()]);

  return (
    <>
      <PageHeader
        title="Automations"
        description="Connect the CRM to n8n with signed webhooks and an API key."
        actions={
          <WebhookFormDialog
            events={events}
            trigger={
              <Button>
                <Plus />
                New subscription
              </Button>
            }
          />
        }
      />
      <N8nGuide events={events} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Webhook subscriptions</h2>
        <WebhooksTable webhooks={webhooks} events={events} />
      </section>
    </>
  );
}

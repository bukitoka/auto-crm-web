import { Pencil, Webhook } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { deleteWebhook } from "../actions";
import type { WebhookSubscription } from "../types";
import { WebhookActiveSwitch } from "./webhook-active-switch";
import { WebhookFormDialog } from "./webhook-form-dialog";

type WebhooksTableProps = {
  webhooks: WebhookSubscription[];
  events: string[];
};

export function WebhooksTable({ webhooks, events }: WebhooksTableProps) {
  if (webhooks.length === 0) {
    return (
      <EmptyState
        icon={Webhook}
        title="No subscriptions yet"
        description="Create one to send CRM events to an n8n workflow."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Target URL</TableHead>
            <TableHead className="hidden md:table-cell">Created</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {webhooks.map((webhook) => (
            <TableRow key={webhook.id}>
              <TableCell>
                <Badge variant="secondary" className="font-mono">
                  {webhook.event}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate font-mono text-xs">
                {webhook.target_url}
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatDate(webhook.created_at)}
              </TableCell>
              <TableCell>
                <WebhookActiveSwitch id={webhook.id} isActive={webhook.is_active} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <WebhookFormDialog
                    webhook={webhook}
                    events={events}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit subscription">
                        <Pencil />
                      </Button>
                    }
                  />
                  <ConfirmDeleteButton
                    title="Delete subscription?"
                    description="n8n will stop receiving this event."
                    action={deleteWebhook.bind(null, webhook.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

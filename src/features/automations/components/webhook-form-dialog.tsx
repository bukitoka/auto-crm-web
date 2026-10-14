"use client";

import { type ReactNode, useState, useTransition } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import { toastResult } from "@/lib/toast-result";
import { createWebhook, updateWebhook } from "../actions";
import { emptyWebhookForm, type WebhookFormValues } from "../schemas";
import type { WebhookSubscription } from "../types";
import { WebhookForm } from "./webhook-form";
import { WebhookSecretDialog } from "./webhook-secret-dialog";

type WebhookFormDialogProps = {
  webhook?: WebhookSubscription;
  events: string[];
  trigger: ReactNode;
};

export function WebhookFormDialog({ webhook, events, trigger }: WebhookFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultValues = webhook
    ? { event: webhook.event, target_url: webhook.target_url, is_active: webhook.is_active }
    : emptyWebhookForm;

  function handleSubmit(values: WebhookFormValues) {
    startTransition(async () => {
      const result = webhook
        ? await updateWebhook(webhook.id, values)
        : await createWebhook(values);
      if (!toastResult(result, webhook ? "Subscription updated" : "Subscription created")) return;
      setOpen(false);
      if (!webhook && result.data.secret) setSecret(result.data.secret);
    });
  }

  return (
    <>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        trigger={trigger}
        title={webhook ? "Edit subscription" : "New webhook subscription"}
        description="The API will POST a signed JSON payload to this URL whenever the event happens."
        formId="webhook-form"
        submitLabel={webhook ? "Save changes" : "Create subscription"}
        isPending={isPending}
      >
        <WebhookForm
          formId="webhook-form"
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          events={events}
        />
      </FormDialog>
      <WebhookSecretDialog secret={secret} onClose={() => setSecret(null)} />
    </>
  );
}

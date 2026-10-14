"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { SelectField, TextField } from "@/components/shared/form-fields";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { type WebhookFormValues, webhookFormSchema } from "../schemas";

type WebhookFormProps = {
  formId: string;
  defaultValues: WebhookFormValues;
  onSubmit: (values: WebhookFormValues) => void;
  events: string[];
};

export function WebhookForm({ formId, defaultValues, onSubmit, events }: WebhookFormProps) {
  const { control, handleSubmit } = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <SelectField
          control={control}
          name="event"
          label="Event"
          options={events.map((event) => ({ value: event, label: event }))}
          placeholder="Choose an event"
        />
        <TextField
          control={control}
          name="target_url"
          label="Target URL"
          type="url"
          placeholder="http://localhost:5678/webhook/new-lead"
          description="Usually an n8n Webhook node's production URL."
        />
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="is_active">Active</FieldLabel>
                <FieldDescription>Inactive subscriptions receive no events.</FieldDescription>
              </FieldContent>
              <Switch id="is_active" checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@/components/shared/date-picker";
import { OptionSelect } from "@/components/shared/option-select";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toastResult } from "@/lib/toast-result";
import { createActivity } from "../actions";
import { type ActivityFormValues, activityFormSchema, emptyActivityForm } from "../schemas";
import { ACTIVITY_TYPES } from "../types";

const typeOptions = ACTIVITY_TYPES.map((type) => ({
  value: type,
  label: type[0].toUpperCase() + type.slice(1),
}));

/** Inline form to log a note/call/email/meeting on a contact or deal. */
export function AddActivityForm({ contactId, dealId }: { contactId?: string; dealId?: string }) {
  const [isPending, startTransition] = useTransition();
  const defaults = emptyActivityForm({ contactId, dealId });
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: defaults,
  });

  function onSubmit(values: ActivityFormValues) {
    startTransition(async () => {
      const result = await createActivity(values);
      if (toastResult(result, "Activity logged")) form.reset(defaults);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Controller
            name="type"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="activity-type">Type</FieldLabel>
                <OptionSelect
                  id="activity-type"
                  value={field.value}
                  onChange={field.onChange}
                  options={typeOptions}
                />
              </Field>
            )}
          />
          <Controller
            name="subject"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="activity-subject">Subject</FieldLabel>
                <Input
                  {...field}
                  id="activity-subject"
                  placeholder="Intro call"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
          <Controller
            name="occurred_at"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="activity-date">Date</FieldLabel>
                <DatePicker
                  id="activity-date"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Now"
                />
              </Field>
            )}
          />
        </div>
        <Controller
          name="body"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="activity-body">Details</FieldLabel>
              <Textarea
                {...field}
                id="activity-body"
                rows={3}
                placeholder="What happened? Next steps?"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Log activity
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

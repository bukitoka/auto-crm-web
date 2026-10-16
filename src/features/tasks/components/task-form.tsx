"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DateField, SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import type { ContactRef } from "@/features/contacts/types";
import type { DealRef } from "@/features/deals/types";
import { personName } from "@/lib/format";
import { enumOptions, toOptions } from "@/lib/options";
import { type TaskFormValues, taskFormSchema } from "../schemas";
import { TASK_PRIORITIES } from "../types";
import { taskStatusOptions } from "./task-badges";

export type TaskFormOptions = {
  contacts: ContactRef[];
  deals: DealRef[];
};

type TaskFormProps = TaskFormOptions & {
  formId: string;
  defaultValues: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
};

export function TaskForm({ formId, defaultValues, onSubmit, contacts, deals }: TaskFormProps) {
  const { control, handleSubmit } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <TextField
          control={control}
          name="title"
          label="Title"
          className="sm:col-span-2"
          placeholder="Call back about pricing"
          autoFocus
        />
        <TextareaField
          control={control}
          name="description"
          label="Description"
          className="sm:col-span-2"
          rows={3}
        />
        <DateField control={control} name="due_date" label="Due date" />
        <SelectField
          control={control}
          name="priority"
          label="Priority"
          options={enumOptions(TASK_PRIORITIES)}
        />
        <SelectField control={control} name="status" label="Status" options={taskStatusOptions} />
        <SelectField
          control={control}
          name="contact_id"
          label="Contact"
          options={toOptions(contacts, personName)}
          allowNone
        />
        <SelectField
          control={control}
          name="deal_id"
          label="Deal"
          options={toOptions(deals, (d) => d.title)}
          allowNone
        />
      </FieldGroup>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DateField, SelectField, TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import type { CompanyRef } from "@/features/companies/types";
import type { ContactRef } from "@/features/contacts/types";
import type { UserRef } from "@/features/users/types";
import { personName } from "@/lib/format";
import { toOptions } from "@/lib/options";
import { type DealFormValues, dealFormSchema } from "../schemas";
import type { PipelineStage } from "../types";

export type DealFormOptions = {
  stages: PipelineStage[];
  companies: CompanyRef[];
  contacts: ContactRef[];
  users: UserRef[];
};

type DealFormProps = DealFormOptions & {
  formId: string;
  defaultValues: DealFormValues;
  onSubmit: (values: DealFormValues) => void;
};

export function DealForm({
  formId,
  defaultValues,
  onSubmit,
  stages,
  companies,
  contacts,
  users,
}: DealFormProps) {
  const { control, handleSubmit } = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
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
          placeholder="Acme — annual plan"
          autoFocus
        />
        <TextField
          control={control}
          name="value"
          label="Value"
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
        />
        <TextField control={control} name="currency" label="Currency" maxLength={3} />
        <SelectField
          control={control}
          name="stage_id"
          label="Stage"
          options={toOptions(stages, (s) => s.name)}
        />
        <DateField control={control} name="expected_close_date" label="Expected close" />
        <SelectField
          control={control}
          name="contact_id"
          label="Contact"
          options={toOptions(contacts, personName)}
          allowNone
        />
        <SelectField
          control={control}
          name="company_id"
          label="Company"
          options={toOptions(companies, (c) => c.name)}
          allowNone
        />
        <SelectField
          control={control}
          name="owner_id"
          label="Owner"
          options={toOptions(users, (u) => u.full_name)}
          placeholder="Me"
          allowNone
        />
      </FieldGroup>
    </form>
  );
}

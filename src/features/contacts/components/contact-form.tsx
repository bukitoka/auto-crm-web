"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import type { CompanyRef } from "@/features/companies/types";
import type { UserRef } from "@/features/users/types";
import { enumOptions, toOptions } from "@/lib/options";
import { type ContactFormValues, contactFormSchema } from "../schemas";
import { CONTACT_SOURCES, CONTACT_STATUSES } from "../types";

type ContactFormProps = {
  formId: string;
  defaultValues: ContactFormValues;
  onSubmit: (values: ContactFormValues) => void;
  companies: CompanyRef[];
  users: UserRef[];
};

export function ContactForm({
  formId,
  defaultValues,
  onSubmit,
  companies,
  users,
}: ContactFormProps) {
  // Keep sources set elsewhere (e.g. by n8n integrations) selectable.
  const sourceOptions = enumOptions(
    !defaultValues.source ||
      CONTACT_SOURCES.includes(defaultValues.source as (typeof CONTACT_SOURCES)[number])
      ? CONTACT_SOURCES
      : [...CONTACT_SOURCES, defaultValues.source],
  );
  const { control, handleSubmit } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <TextField control={control} name="first_name" label="First name" autoFocus />
        <TextField control={control} name="last_name" label="Last name" />
        <TextField control={control} name="email" label="Email" type="email" />
        <TextField control={control} name="phone" label="Phone" type="tel" />
        <TextField control={control} name="job_title" label="Job title" />
        <SelectField
          control={control}
          name="company_id"
          label="Company"
          options={toOptions(companies, (c) => c.name)}
          allowNone
        />
        <SelectField
          control={control}
          name="status"
          label="Status"
          options={enumOptions(CONTACT_STATUSES)}
        />
        <SelectField control={control} name="source" label="Source" options={sourceOptions} />
        <SelectField
          control={control}
          name="owner_id"
          label="Owner"
          options={toOptions(users, (u) => u.full_name)}
          placeholder="Me"
          allowNone
        />
        <TextField
          control={control}
          name="tags"
          label="Tags"
          placeholder="vip, newsletter"
          description="Comma separated"
        />
      </FieldGroup>
    </form>
  );
}

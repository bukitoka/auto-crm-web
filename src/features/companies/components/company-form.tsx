"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import { COMPANY_SIZES, type CompanyFormValues, companyFormSchema } from "../schemas";

type CompanyFormProps = {
  formId: string;
  defaultValues: CompanyFormValues;
  onSubmit: (values: CompanyFormValues) => void;
};

const sizeOptions = COMPANY_SIZES.map((size) => ({ value: size, label: `${size} employees` }));

export function CompanyForm({ formId, defaultValues, onSubmit }: CompanyFormProps) {
  const { control, handleSubmit } = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues,
  });

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <TextField control={control} name="name" label="Name" autoFocus />
        <TextField control={control} name="industry" label="Industry" placeholder="Software" />
        <TextField control={control} name="domain" label="Domain" placeholder="acme.com" />
        <TextField
          control={control}
          name="website"
          label="Website"
          type="url"
          placeholder="https://acme.com"
        />
        <SelectField control={control} name="size" label="Size" options={sizeOptions} allowNone />
        <TextareaField
          control={control}
          name="notes"
          label="Notes"
          rows={3}
          className="sm:col-span-2"
        />
      </FieldGroup>
    </form>
  );
}

"use client";

import { type ReactNode, useState, useTransition } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import { toastResult } from "@/lib/toast-result";
import { createCompany, updateCompany } from "../actions";
import { type CompanyFormValues, companyToForm, emptyCompanyForm } from "../schemas";
import type { Company } from "../types";
import { CompanyForm } from "./company-form";

type CompanyFormDialogProps = {
  company?: Company;
  trigger: ReactNode;
};

export function CompanyFormDialog({ company, trigger }: CompanyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues = company ? companyToForm(company) : emptyCompanyForm;

  function handleSubmit(values: CompanyFormValues) {
    startTransition(async () => {
      const result = company
        ? await updateCompany(company.id, values)
        : await createCompany(values);
      if (toastResult(result, company ? "Company updated" : "Company created")) setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={company ? "Edit company" : "New company"}
      formId="company-form"
      submitLabel={company ? "Save changes" : "Create company"}
      isPending={isPending}
    >
      <CompanyForm formId="company-form" defaultValues={defaultValues} onSubmit={handleSubmit} />
    </FormDialog>
  );
}

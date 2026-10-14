"use client";

import { type ReactNode, useState, useTransition } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import { toastResult } from "@/lib/toast-result";
import { createDeal, updateDeal } from "../actions";
import { type DealFormValues, dealToForm, emptyDealForm } from "../schemas";
import type { Deal } from "../types";
import { DealForm, type DealFormOptions } from "./deal-form";

type DealFormDialogProps = DealFormOptions & {
  deal?: Deal;
  initialValues?: Partial<DealFormValues>;
  trigger: ReactNode;
};

export function DealFormDialog({ deal, initialValues, trigger, ...options }: DealFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues = deal
    ? dealToForm(deal)
    : { ...emptyDealForm(options.stages[0]?.id), ...initialValues };

  function handleSubmit(values: DealFormValues) {
    startTransition(async () => {
      const result = deal ? await updateDeal(deal.id, values) : await createDeal(values);
      if (toastResult(result, deal ? "Deal updated" : "Deal created")) setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={deal ? "Edit deal" : "New deal"}
      formId="deal-form"
      submitLabel={deal ? "Save changes" : "Create deal"}
      isPending={isPending}
    >
      <DealForm
        formId="deal-form"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        {...options}
      />
    </FormDialog>
  );
}

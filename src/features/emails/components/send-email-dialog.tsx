"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import type { DealRef } from "@/features/deals/types";
import { toOptions } from "@/lib/options";
import { toastResult } from "@/lib/toast-result";
import { sendEmail } from "../actions";
import { type SendEmailValues, sendEmailSchema } from "../schemas";

type SendEmailDialogProps = {
  contactId: string;
  contactName: string;
  /** Without an address the button is disabled. */
  contactEmail: string | null;
  deals: DealRef[];
};

/** Compose and send an email to a contact; it is logged on their timeline. */
export function SendEmailDialog({
  contactId,
  contactName,
  contactEmail,
  deals,
}: SendEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<SendEmailValues>({
    resolver: zodResolver(sendEmailSchema),
    defaultValues: { subject: "", body: "", deal_id: "" },
  });

  function onSubmit(values: SendEmailValues) {
    startTransition(async () => {
      const result = await sendEmail(contactId, values);
      if (!toastResult(result, `Email sent to ${contactName}`)) return;
      reset();
      setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          disabled={!contactEmail}
          title={contactEmail ? undefined : "Add an email address to this contact first"}
        >
          <Send />
          Send email
        </Button>
      }
      title={`Email ${contactName}`}
      description={`To ${contactEmail}. Replies come back to your own inbox.`}
      formId="send-email-form"
      submitLabel="Send"
      isPending={isPending}
    >
      <form id="send-email-form" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="gap-4">
          <TextField control={control} name="subject" label="Subject" />
          <TextareaField control={control} name="body" label="Message" rows={8} />
          {deals.length > 0 ? (
            <SelectField
              control={control}
              name="deal_id"
              label="Related deal"
              options={toOptions(deals, (d) => d.title)}
              allowNone
            />
          ) : null}
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

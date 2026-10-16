"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { SelectField, TextareaField, TextField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { draftEmail } from "@/features/ai/actions";
import { type EmailDraftValues, emailDraftSchema } from "@/features/ai/schemas";
import { EMAIL_TONES } from "@/features/ai/types";
import type { DealRef } from "@/features/deals/types";
import { enumOptions, toOptions } from "@/lib/options";
import { toastResult } from "@/lib/toast-result";
import { sendEmail } from "../actions";
import { type ComposeEmailValues, composeEmailSchema } from "../schemas";

/** Someone to write to. `email: null` = known to have no address; `undefined` = not loaded. */
export type EmailRecipient = { id: string; name: string; email?: string | null };

const writeSchema = emailDraftSchema.pick({ purpose: true, tone: true });
type WriteValues = Pick<EmailDraftValues, "purpose" | "tone">;

type ComposeEmailDialogProps = {
  recipients: EmailRecipient[];
  deals: DealRef[];
  /** Pre-selected recipient and deal (e.g. the contact or deal being viewed). */
  contactId?: string;
  dealId?: string;
};

export function ComposeEmailDialog({
  recipients,
  deals,
  contactId = "",
  dealId = "",
}: ComposeEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [showWriter, setShowWriter] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [isSending, startSending] = useTransition();
  const [isWriting, startWriting] = useTransition();
  const { control, handleSubmit, reset, setValue, setError, getValues } =
    useForm<ComposeEmailValues>({
      resolver: zodResolver(composeEmailSchema),
      defaultValues: { contact_id: contactId, subject: "", body: "", deal_id: dealId },
    });
  const writer = useForm<WriteValues>({
    resolver: zodResolver(writeSchema),
    defaultValues: { purpose: "", tone: "friendly" },
  });
  const to = useWatch({ control, name: "contact_id" });
  const recipient = recipients.find((r) => r.id === to);

  function write(values: WriteValues) {
    if (!to) {
      setError("contact_id", { message: "Choose who to email" });
      return;
    }
    startWriting(async () => {
      const result = await draftEmail(to, { ...values, deal_id: getValues("deal_id") });
      if (!toastResult(result)) return;
      setValue("subject", result.data.subject, { shouldValidate: true });
      setValue("body", result.data.body, { shouldValidate: true });
      setHasDraft(true);
    });
  }

  function send({ contact_id, ...values }: ComposeEmailValues) {
    if (recipient?.email === null) {
      setError("contact_id", { message: "Add an email address to this contact first" });
      return;
    }
    startSending(async () => {
      const result = await sendEmail(contact_id, values);
      if (!toastResult(result, `Email sent to ${recipient?.name ?? "the contact"}`)) return;
      reset();
      writer.reset();
      setHasDraft(false);
      setShowWriter(false);
      setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="outline">
          <Send />
          Send email
        </Button>
      }
      title="Send an email"
      description={
        recipient?.email
          ? `To ${recipient.email}. Replies come back to your own inbox.`
          : "Replies come back to your own inbox."
      }
      formId="compose-email-form"
      submitLabel="Send"
      isPending={isSending || isWriting}
    >
      <form id="compose-email-form" onSubmit={handleSubmit(send)}>
        <FieldGroup className="gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              control={control}
              name="contact_id"
              label="To"
              options={toOptions(recipients, (r) => r.name)}
              placeholder="Choose a contact…"
            />
            {deals.length > 0 ? (
              <SelectField
                control={control}
                name="deal_id"
                label="Related deal"
                options={toOptions(deals, (d) => d.title)}
                allowNone
              />
            ) : null}
          </div>

          {showWriter ? (
            <div className="space-y-4 rounded-md border bg-muted/40 p-4">
              <TextareaField
                control={writer.control}
                name="purpose"
                label="What is the email for?"
                rows={2}
                placeholder="Follow up on last week's demo and propose a pilot"
              />
              <div className="flex flex-wrap items-end gap-3">
                <SelectField
                  control={writer.control}
                  name="tone"
                  label="Tone"
                  options={enumOptions(EMAIL_TONES)}
                  className="min-w-40 flex-1"
                />
                <Button
                  type="button"
                  onClick={writer.handleSubmit(write)}
                  disabled={isWriting || isSending}
                >
                  {isWriting ? <Spinner /> : <Sparkles />}
                  {hasDraft ? "Regenerate" : "Write it"}
                </Button>
              </div>
              {isWriting ? (
                <p className="text-sm text-muted-foreground">
                  Writing your email… this can take a few seconds.
                </p>
              ) : null}
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="self-start"
              onClick={() => setShowWriter(true)}
            >
              <Sparkles />
              Write with AI
            </Button>
          )}

          <TextField control={control} name="subject" label="Subject" />
          <TextareaField control={control} name="body" label="Message" rows={10} />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Send, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { SelectField, TextareaField } from "@/components/shared/form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import type { DealRef } from "@/features/deals/types";
import { sendEmail } from "@/features/emails/actions";
import { enumOptions, toOptions } from "@/lib/options";
import { toastResult } from "@/lib/toast-result";
import { draftEmail } from "../actions";
import { type EmailDraftValues, emailDraftSchema } from "../schemas";
import { EMAIL_TONES, type EmailDraft } from "../types";

type EmailDraftDialogProps = {
  contactId: string;
  contactEmail: string | null;
  deals: DealRef[];
};

export function EmailDraftDialog({ contactId, contactEmail, deals }: EmailDraftDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<EmailDraft | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSending, startSending] = useTransition();
  const { control, handleSubmit, getValues } = useForm<EmailDraftValues>({
    resolver: zodResolver(emailDraftSchema),
    defaultValues: { purpose: "", tone: "friendly", deal_id: "" },
  });

  function onSubmit(values: EmailDraftValues) {
    startTransition(async () => {
      const result = await draftEmail(contactId, values);
      if (toastResult(result)) setDraft(result.data);
    });
  }

  async function copyDraft() {
    if (!draft) return;
    await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
    toast.success("Copied to clipboard");
  }

  function sendDraft() {
    if (!draft) return;
    startSending(async () => {
      const result = await sendEmail(contactId, {
        subject: draft.subject,
        body: draft.body,
        deal_id: getValues("deal_id"),
      });
      if (!toastResult(result, "Email sent")) return;
      setDraft(null);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles />
          Draft email with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draft an email</DialogTitle>
          <DialogDescription>
            Describe the goal; AI writes a subject and body using this contact's context.
          </DialogDescription>
        </DialogHeader>
        <form id="email-draft-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <TextareaField
              control={control}
              name="purpose"
              label="Purpose"
              rows={2}
              placeholder="Follow up on last week's demo and propose a pilot"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                control={control}
                name="tone"
                label="Tone"
                options={enumOptions(EMAIL_TONES)}
              />
              <SelectField
                control={control}
                name="deal_id"
                label="Related deal"
                options={toOptions(deals, (d) => d.title)}
                allowNone
              />
            </div>
          </FieldGroup>
        </form>

        {isPending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner /> Writing your draft… this can take a few seconds.
          </p>
        ) : null}

        {draft && !isPending ? (
          <div className="space-y-3 rounded-md border bg-muted/40 p-4">
            <div className="space-y-1.5">
              <Label htmlFor="draft-subject">Subject</Label>
              <Input
                id="draft-subject"
                value={draft.subject}
                onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="draft-body">Body</Label>
              <Textarea
                id="draft-body"
                rows={10}
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {draft ? (
            <>
              <Button type="button" variant="outline" onClick={copyDraft}>
                <Copy />
                Copy
              </Button>
              {contactEmail ? (
                <Button type="button" onClick={sendDraft} disabled={isSending || isPending}>
                  {isSending ? <Spinner /> : <Send />}
                  Send
                </Button>
              ) : null}
            </>
          ) : null}
          <Button
            type="submit"
            form="email-draft-form"
            variant={draft ? "outline" : "default"}
            disabled={isPending || isSending}
          >
            {isPending ? <Spinner /> : <Sparkles />}
            {draft ? "Regenerate" : "Generate draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

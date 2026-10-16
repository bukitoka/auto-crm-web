"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ScanText, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TextareaField } from "@/components/shared/form-fields";
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
import { Spinner } from "@/components/ui/spinner";
import type { CompanyRef } from "@/features/companies/types";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import type { ContactFormValues } from "@/features/contacts/schemas";
import type { ActionResult } from "@/lib/action-result";
import { MAX_UPLOAD_BYTES } from "@/lib/constants";
import { toastResult } from "@/lib/toast-result";
import { extractContact, extractContactFromFile } from "../actions";
import { type ExtractContactValues, extractContactSchema } from "../schemas";
import type { ExtractedContact } from "../types";
import { CaptureDropzone } from "./capture-dropzone";

type SmartCaptureDialogProps = {
  companies: CompanyRef[];
};

/** Map AI-extracted fields onto the contact form; match company by name. */
function toFormValues(data: ExtractedContact, companies: CompanyRef[]): Partial<ContactFormValues> {
  const company = data.company_name
    ? companies.find((c) => c.name.toLowerCase() === data.company_name?.toLowerCase())
    : undefined;
  return {
    first_name: data.first_name ?? "",
    last_name: data.last_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    job_title: data.job_title ?? "",
    company_id: company?.id ?? "",
    source: "manual",
  };
}

/** Nothing is saved here: the extracted fields open the regular contact form for review. */
export function SmartCaptureDialog({ companies }: SmartCaptureDialogProps) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<ContactFormValues> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<ExtractContactValues>({
    resolver: zodResolver(extractContactSchema),
    defaultValues: { text: "" },
  });

  function chooseFile(next: File | null) {
    if (next && next.size > MAX_UPLOAD_BYTES) {
      toast.error("Files can be at most 5 MB");
      return;
    }
    setFile(next);
  }

  /** ⌘/Ctrl+V with an image or file on the clipboard attaches it (text pastes normally). */
  function handlePaste(event: React.ClipboardEvent) {
    const pasted = event.clipboardData.files[0];
    if (!pasted) return;
    event.preventDefault();
    chooseFile(pasted);
  }

  function onSubmit(values: ExtractContactValues) {
    startTransition(async () => {
      showResult(await extractContact(values));
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    if (!file) {
      handleSubmit(onSubmit)(event);
      return;
    }
    event.preventDefault();
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      showResult(await extractContactFromFile(formData));
    });
  }

  function showResult(result: ActionResult<ExtractedContact>) {
    if (!toastResult(result)) return;

    const formValues = toFormValues(result.data, companies);
    if (result.data.company_name && !formValues.company_id) {
      toast.info(`Company "${result.data.company_name}" isn't in the CRM yet`, {
        description: "Create it on the Companies page and link it later.",
      });
    }
    setOpen(false);
    reset();
    setFile(null);
    setPrefill(formValues);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <ScanText />
            Smart capture
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg" onPaste={handlePaste}>
          <DialogHeader>
            <DialogTitle>Smart capture</DialogTitle>
            <DialogDescription>
              Capture anything: a business card photo, a screenshot, a PDF or Word file, an email,
              or pasted text. AI pulls out the contact details for you to review.
            </DialogDescription>
          </DialogHeader>
          <form id="smart-capture-form" onSubmit={submit} className="flex flex-col gap-4">
            <CaptureDropzone file={file} onFileChange={chooseFile} disabled={isPending} />
            {file ? null : (
              <>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  or paste text
                  <span className="h-px flex-1 bg-border" />
                </div>
                <TextareaField
                  control={control}
                  name="text"
                  label="Text"
                  rows={6}
                  placeholder={
                    "Jane Doe\nHead of Operations, Acme Inc.\njane@acme.com · +1 555 0100"
                  }
                />
              </>
            )}
          </form>
          {isPending ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner />
              {file ? "Reading the file and extracting details…" : "Extracting details…"} this can
              take a few seconds.
            </p>
          ) : null}
          <DialogFooter>
            <Button type="submit" form="smart-capture-form" disabled={isPending}>
              {isPending ? <Spinner /> : <Sparkles />}
              Extract contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {prefill ? (
        <ContactFormDialog
          open
          onOpenChange={(next) => {
            if (!next) setPrefill(null);
          }}
          initialValues={prefill}
          companies={companies}
        />
      ) : null}
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState, useTransition } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import type { CompanyRef } from "@/features/companies/types";
import type { UserRef } from "@/features/users/types";
import { toastResult } from "@/lib/toast-result";
import { createContact, updateContact } from "../actions";
import { type ContactFormValues, contactToForm, emptyContactForm } from "../schemas";
import type { Contact } from "../types";
import { ContactForm } from "./contact-form";

type ContactFormDialogProps = {
  contact?: Contact;
  /** Prefill for create mode (e.g. from AI smart capture). */
  initialValues?: Partial<ContactFormValues>;
  companies: CompanyRef[];
  users: UserRef[];
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ContactFormDialog({
  contact,
  initialValues,
  companies,
  users,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ContactFormDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const defaultValues = contact
    ? contactToForm(contact)
    : { ...emptyContactForm, ...initialValues };

  function handleSubmit(values: ContactFormValues) {
    startTransition(async () => {
      const result = contact
        ? await updateContact(contact.id, values)
        : await createContact(values);
      if (!toastResult(result, contact ? "Contact updated" : "Contact created")) return;
      setOpen(false);
      if (!contact) router.push(`/contacts/${result.data.id}`);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={contact ? "Edit contact" : "New contact"}
      description={contact ? undefined : "Add a person to your CRM."}
      formId="contact-form"
      submitLabel={contact ? "Save changes" : "Create contact"}
      isPending={isPending}
    >
      <ContactForm
        formId="contact-form"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        companies={companies}
        users={users}
      />
    </FormDialog>
  );
}

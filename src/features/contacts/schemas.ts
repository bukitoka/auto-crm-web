import { z } from "zod";
import { emptyToNull } from "@/lib/form";
import { CONTACT_STATUSES, type Contact, type ContactPayload } from "./types";

export const contactFormSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100),
  last_name: z.string().trim().max(100),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  phone: z.string().trim().max(50),
  job_title: z.string().trim().max(150),
  status: z.enum(CONTACT_STATUSES),
  source: z.string(),
  /** Comma-separated in the form, `string[]` in the API. */
  tags: z.string(),
  company_id: z.string(),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const emptyContactForm: ContactFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_title: "",
  status: "lead",
  source: "manual",
  tags: "",
  company_id: "",
};

export function contactToForm(contact: Contact): ContactFormValues {
  return {
    first_name: contact.first_name,
    last_name: contact.last_name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    job_title: contact.job_title ?? "",
    status: contact.status,
    source: contact.source,
    tags: contact.tags.join(", "),
    company_id: contact.company_id ?? "",
  };
}

export function toContactPayload(values: ContactFormValues): ContactPayload {
  const tags = values.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const source = values.source || "manual";
  return { ...(emptyToNull(values) as Omit<ContactPayload, "tags" | "source">), source, tags };
}

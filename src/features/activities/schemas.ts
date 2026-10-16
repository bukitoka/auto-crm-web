import { z } from "zod";
import { emptyToNull } from "@/lib/form";
import { ACTIVITY_TYPES, type ActivityPayload } from "./types";

export const activityFormSchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim(),
  occurred_at: z.string(),
  contact_id: z.string(),
  deal_id: z.string(),
});
export type ActivityFormValues = z.infer<typeof activityFormSchema>;

export function emptyActivityForm(link: {
  contactId?: string;
  dealId?: string;
}): ActivityFormValues {
  return {
    type: "note",
    subject: "",
    body: "",
    occurred_at: "",
    contact_id: link.contactId ?? "",
    deal_id: link.dealId ?? "",
  };
}

export function toActivityPayload(values: ActivityFormValues): ActivityPayload {
  const payload = emptyToNull(values) as ActivityPayload;
  // A date-only input becomes midnight UTC; omit to let the API default to "now".
  return {
    ...payload,
    occurred_at: values.occurred_at ? new Date(values.occurred_at).toISOString() : null,
  };
}

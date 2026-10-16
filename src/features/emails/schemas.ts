import { z } from "zod";

export const sendEmailSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Write a message").max(20_000),
  /** Optional deal to log the email on as well; `""` means none. */
  deal_id: z.string(),
});
export type SendEmailValues = z.infer<typeof sendEmailSchema>;

/** The compose dialog also picks who to write to (on a deal page there can be several). */
export const composeEmailSchema = sendEmailSchema.extend({
  contact_id: z.string().min(1, "Choose who to email"),
});
export type ComposeEmailValues = z.infer<typeof composeEmailSchema>;

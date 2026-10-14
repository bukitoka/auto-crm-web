import { z } from "zod";

export const sendEmailSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  body: z.string().trim().min(1, "Write a message").max(20_000),
  /** Optional deal to log the email on as well; `""` means none. */
  deal_id: z.string(),
});
export type SendEmailValues = z.infer<typeof sendEmailSchema>;

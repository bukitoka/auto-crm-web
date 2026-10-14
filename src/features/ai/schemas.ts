import { z } from "zod";
import { EMAIL_TONES } from "./types";

export const emailDraftSchema = z.object({
  purpose: z.string().trim().min(3, "Describe what the email is for").max(500),
  tone: z.enum(EMAIL_TONES),
  deal_id: z.string(),
});
export type EmailDraftValues = z.infer<typeof emailDraftSchema>;

export const extractContactSchema = z.object({
  text: z.string().trim().min(10, "Paste a bit more text (signature, card, email…)").max(8000),
});
export type ExtractContactValues = z.infer<typeof extractContactSchema>;

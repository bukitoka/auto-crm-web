export type LeadScore = {
  score: number;
  reasoning: string;
};

export const EMAIL_TONES = ["friendly", "professional", "formal", "persuasive", "concise"] as const;
export type EmailTone = (typeof EMAIL_TONES)[number];

export type EmailDraftRequest = {
  contact_id: string;
  deal_id?: string | null;
  purpose: string;
  tone: EmailTone;
};

export type EmailDraft = {
  subject: string;
  body: string;
};

export type TimelineSummary = {
  summary: string;
  next_actions: string[];
};

/** Fields returned by `/ai/extract-contact` (not saved yet). All optional. */
export type ExtractedContact = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  website?: string | null;
};

/** Smart capture from a file: the extracted fields plus the text the API read (OCR etc.). */
export type CapturedContact = ExtractedContact & { source_text: string };

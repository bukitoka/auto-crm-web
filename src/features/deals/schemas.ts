import { z } from "zod";
import { emptyToNull } from "@/lib/form";
import { toDateInput } from "@/lib/format";
import type { Deal, DealPayload } from "./types";

export const dealFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  value: z
    .string()
    .trim()
    .refine((v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0, "Enter an amount"),
  currency: z.string().trim().length(3, "Use a 3-letter code, e.g. USD").toUpperCase(),
  stage_id: z.string().min(1, "Pick a stage"),
  contact_id: z.string(),
  company_id: z.string(),
  owner_id: z.string(),
  expected_close_date: z.string(),
});
export type DealFormValues = z.infer<typeof dealFormSchema>;

export function emptyDealForm(stageId = ""): DealFormValues {
  return {
    title: "",
    value: "",
    currency: "USD",
    stage_id: stageId,
    contact_id: "",
    company_id: "",
    owner_id: "",
    expected_close_date: "",
  };
}

export function dealToForm(deal: Deal): DealFormValues {
  return {
    title: deal.title,
    value: String(Number(deal.value)),
    currency: deal.currency,
    stage_id: deal.stage_id,
    contact_id: deal.contact_id ?? "",
    company_id: deal.company_id ?? "",
    owner_id: deal.owner_id ?? "",
    expected_close_date: toDateInput(deal.expected_close_date),
  };
}

export function toDealPayload(values: DealFormValues): DealPayload {
  return { ...(emptyToNull(values) as Omit<DealPayload, "value">), value: Number(values.value) };
}

import { z } from "zod"
import type { RecordLinks } from "./record-links"

export const recordLinksSchema = z
  .object({
    contact_id: z.uuid().nullable(),
    company_id: z.uuid().nullable(),
    deal_id: z.uuid().nullable(),
  })
  .refine(
    (links) => Object.values(links).filter(Boolean).length <= 1,
    "Select one linked CRM record",
  )

export function readRecordLinks(data: FormData): RecordLinks {
  return {
    contact_id: String(data.get("contact_id") ?? "") || null,
    company_id: String(data.get("company_id") ?? "") || null,
    deal_id: String(data.get("deal_id") ?? "") || null,
  }
}

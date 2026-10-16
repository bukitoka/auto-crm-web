import { z } from "zod";
import { emptyToNull } from "@/lib/form";
import type { Company, CompanyPayload } from "./types";

export const companyFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  domain: z.string().trim().max(255),
  industry: z.string().trim().max(100),
  size: z.string().trim().max(50),
  website: z.string().trim().max(255),
  notes: z.string(),
});
export type CompanyFormValues = z.infer<typeof companyFormSchema>;

export const emptyCompanyForm: CompanyFormValues = {
  name: "",
  domain: "",
  industry: "",
  size: "",
  website: "",
  notes: "",
};

export const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"] as const;

export function companyToForm(company: Company): CompanyFormValues {
  return {
    name: company.name,
    domain: company.domain ?? "",
    industry: company.industry ?? "",
    size: company.size ?? "",
    website: company.website ?? "",
    notes: company.notes ?? "",
  };
}

export function toCompanyPayload(values: CompanyFormValues): CompanyPayload {
  return emptyToNull(values) as CompanyPayload;
}

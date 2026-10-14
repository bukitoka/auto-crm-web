"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseImageUpload } from "@/lib/uploads";
import { type CompanyFormValues, companyFormSchema, toCompanyPayload } from "./schemas";
import type { Company } from "./types";

export async function createCompany(values: CompanyFormValues): Promise<ActionResult<Company>> {
  const parsed = parseInput(companyFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Company>("/companies", { method: "POST", body: toCompanyPayload(parsed.data) }),
  );
  if (result.ok) revalidatePath("/companies");
  return result;
}

export async function updateCompany(
  id: string,
  values: CompanyFormValues,
): Promise<ActionResult<Company>> {
  const parsed = parseInput(companyFormSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Company>(`/companies/${id}`, { method: "PATCH", body: toCompanyPayload(parsed.data) }),
  );
  if (result.ok) {
    revalidatePath("/companies");
    revalidatePath(`/companies/${id}`);
  }
  return result;
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  const result = await runAction(() => apiFetch<void>(`/companies/${id}`, { method: "DELETE" }));
  if (result.ok) revalidatePath("/companies");
  return result;
}

function revalidateCompany(id: string) {
  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
}

/** Upload a company logo (`formData.get("file")`). The API stores it in MinIO. */
export async function uploadCompanyLogo(
  id: string,
  formData: FormData,
): Promise<ActionResult<Company>> {
  const parsed = parseImageUpload(formData);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<Company>(`/companies/${id}/logo`, { method: "PUT", body: parsed.data }),
  );
  if (result.ok) revalidateCompany(id);
  return result;
}

export async function removeCompanyLogo(id: string): Promise<ActionResult<Company>> {
  const result = await runAction(() =>
    apiFetch<Company>(`/companies/${id}/logo`, { method: "DELETE" }),
  );
  if (result.ok) revalidateCompany(id);
  return result;
}

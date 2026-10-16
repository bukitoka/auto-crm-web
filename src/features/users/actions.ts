"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseImageUpload } from "@/lib/uploads";
import { type AdminCreateValues, adminCreateSchema } from "./schemas";
import type { User } from "./types";

export async function uploadMyAvatar(formData: FormData): Promise<ActionResult<User>> {
  const parsed = parseImageUpload(formData);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<User>("/users/me/avatar", { method: "PUT", body: parsed.data }),
  );
  // The avatar appears in the sidebar and on owned records, so refresh every page.
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

export async function removeMyAvatar(): Promise<ActionResult<User>> {
  const result = await runAction(() => apiFetch<User>("/users/me/avatar", { method: "DELETE" }));
  if (result.ok) revalidatePath("/", "layout");
  return result;
}

/** Super admin: create an admin account. */
export async function createAdmin(values: AdminCreateValues): Promise<ActionResult<User>> {
  const parsed = parseInput(adminCreateSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<User>("/users", { method: "POST", body: parsed.data }),
  );
  if (result.ok) revalidatePath("/team");
  return result;
}

/** Super admin: rename an admin or switch the account on or off. */
export async function updateUser(
  id: string,
  changes: { full_name?: string; is_active?: boolean },
): Promise<ActionResult<User>> {
  const result = await runAction(() =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body: changes }),
  );
  if (result.ok) revalidatePath("/team");
  return result;
}

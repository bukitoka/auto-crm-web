"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseImageUpload } from "@/lib/uploads";
import type { User, UserRole } from "./types";

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

/** Admin: change a teammate's role or active status. The API enforces who may change whom. */
export async function updateUser(
  id: string,
  changes: { role?: UserRole; is_active?: boolean },
): Promise<ActionResult<User>> {
  const result = await runAction(() =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body: changes }),
  );
  if (result.ok) revalidatePath("/team");
  return result;
}

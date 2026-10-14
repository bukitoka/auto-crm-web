"use server";

import { revalidatePath } from "next/cache";
import { type ActionResult, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { parseImageUpload } from "@/lib/uploads";
import type { User } from "./types";

/** Upload the current user's profile picture. Shown everywhere they appear. */
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

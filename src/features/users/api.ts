import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import type { Paginated } from "@/lib/types";
import type { User, UserRef } from "./types";

/** Users for owner/assignee pickers. */
export const listUserOptions = cache(async (): Promise<UserRef[]> => {
  const data = await apiFetch<Paginated<User>>("/users", { query: { size: PICKER_PAGE_SIZE } });
  return data.items.filter((user) => user.is_active);
});

/** The n8n service account (see the API's SERVICE_ACCOUNT_EMAIL): not a teammate to manage. */
const SERVICE_ACCOUNT_EMAIL = "automation@auto-crm.local";

/** Every user, active or not, for the Team page. */
export async function listTeam(): Promise<User[]> {
  const data = await apiFetch<Paginated<User>>("/users", { query: { size: PICKER_PAGE_SIZE } });
  return data.items.filter((user) => user.email !== SERVICE_ACCOUNT_EMAIL);
}

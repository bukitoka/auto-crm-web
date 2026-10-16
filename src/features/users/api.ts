import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import type { Paginated } from "@/lib/types";
import type { User, UserRef } from "./types";

/** Every admin, active or not, for the Team page. The API leaves out the super admin and the service account. */
export async function listTeam(): Promise<User[]> {
  const data = await apiFetch<Paginated<User>>("/users", { query: { size: PICKER_PAGE_SIZE } });
  return data.items;
}

/** Active admins, for the super admin's chat filter. */
export const listUserOptions = cache(async (): Promise<UserRef[]> => {
  const users = await listTeam();
  return users.filter((user) => user.is_active);
});

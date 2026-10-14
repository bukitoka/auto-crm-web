import "server-only";
import { cache } from "react";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { getListParams, getParam } from "@/lib/search-params";
import type { Paginated, SearchParams } from "@/lib/types";
import type { Contact, ContactFilters, ContactRef } from "./types";

/** Filters for the contacts list page, read from its URL. */
export function contactFiltersFromParams(params: SearchParams): ContactFilters {
  return { ...getListParams(params), status: getParam(params, "status") };
}

export function listContacts(filters: ContactFilters) {
  return apiFetch<Paginated<Contact>>("/contacts", { query: filters });
}

export function getContact(id: string) {
  return apiFetch<Contact>(`/contacts/${id}`);
}

export const listContactOptions = cache(async (): Promise<ContactRef[]> => {
  const data = await listContacts({ page: 1, size: PICKER_PAGE_SIZE });
  return data.items.map(({ id, first_name, last_name }) => ({ id, first_name, last_name }));
});

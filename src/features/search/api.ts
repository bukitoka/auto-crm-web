import "server-only";
import { listCompanies } from "@/features/companies/api";
import { listContacts } from "@/features/contacts/api";
import { listDeals } from "@/features/deals/api";
import type { SearchResults } from "./types";

/** Global search: query the three list endpoints in parallel (`ILIKE` on the API). */
export async function globalSearch(search: string): Promise<SearchResults> {
  const query = { page: 1, size: 10, search };
  const [contacts, companies, deals] = await Promise.all([
    listContacts(query),
    listCompanies(query),
    listDeals(query),
  ]);
  return { contacts: contacts.items, companies: companies.items, deals: deals.items };
}

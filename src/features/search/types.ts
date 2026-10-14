import type { Company } from "@/features/companies/types";
import type { Contact } from "@/features/contacts/types";
import type { Deal } from "@/features/deals/types";

export type SearchResults = {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
};

/** One row in the header's quick-search dropdown. */
export type QuickSearchItem = {
  id: string;
  kind: "contact" | "company" | "deal" | "all";
  title: string;
  subtitle: string | null;
  href: string;
  image: string | null;
};

export type QuickSearchGroup = {
  label: string;
  items: QuickSearchItem[];
};

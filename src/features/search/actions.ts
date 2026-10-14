"use server";

import { listCompanies } from "@/features/companies/api";
import { listContacts } from "@/features/contacts/api";
import { listDeals } from "@/features/deals/api";
import { type ActionResult, runAction } from "@/lib/action-result";
import { formatCurrency, personName } from "@/lib/format";
import type { QuickSearchGroup } from "./types";

const PER_GROUP = 5;

/** Live results for the header search box: a few matches per record type. */
export async function quickSearch(query: string): Promise<ActionResult<QuickSearchGroup[]>> {
  const search = query.trim();
  if (search.length < 2) return { ok: true, data: [] };

  return runAction(async () => {
    const params = { page: 1, size: PER_GROUP, search };
    const [contacts, companies, deals] = await Promise.all([
      listContacts(params),
      listCompanies(params),
      listDeals(params),
    ]);
    const groups: QuickSearchGroup[] = [
      {
        label: "Contacts",
        items: contacts.items.map((c) => ({
          id: c.id,
          kind: "contact",
          title: personName(c),
          subtitle: c.email ?? c.company?.name ?? null,
          href: `/contacts/${c.id}`,
          image: c.avatar_url,
        })),
      },
      {
        label: "Companies",
        items: companies.items.map((c) => ({
          id: c.id,
          kind: "company",
          title: c.name,
          subtitle: c.industry ?? c.domain,
          href: `/companies/${c.id}`,
          image: c.logo_url,
        })),
      },
      {
        label: "Deals",
        items: deals.items.map((d) => ({
          id: d.id,
          kind: "deal",
          title: d.title,
          subtitle: `${formatCurrency(d.value, d.currency)} · ${d.stage.name}`,
          href: `/deals/${d.id}`,
          image: null,
        })),
      },
    ];
    const found = groups.filter((group) => group.items.length > 0);
    // Always offer the full results page (also where Enter goes with nothing highlighted).
    found.push({
      label: "More",
      items: [
        {
          id: "all",
          kind: "all",
          title: `See all results for “${search}”`,
          subtitle: null,
          href: `/search?q=${encodeURIComponent(search)}`,
          image: null,
        },
      ],
    });
    return found;
  });
}

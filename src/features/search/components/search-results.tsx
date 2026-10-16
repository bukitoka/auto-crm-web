import { Building2, Handshake, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactStatusBadge } from "@/features/contacts/components/contact-status-badge";
import { DealStageBadge } from "@/features/deals/components/deal-stage-badge";
import { formatCurrency, personName } from "@/lib/format";
import type { SearchResults as Results } from "../types";

function Section({
  title,
  icon,
  children,
  empty,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  empty: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 [&>svg]:size-4">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : (
          <ul className="divide-y">{children}</ul>
        )}
      </CardContent>
    </Card>
  );
}

export function SearchResults({ results }: { results: Results }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Section title="Contacts" icon={<Users />} empty={results.contacts.length === 0}>
        {results.contacts.map((contact) => (
          <li key={contact.id} className="flex items-center justify-between gap-2 py-2">
            <Link
              href={`/contacts/${contact.id}`}
              className="truncate text-sm font-medium hover:underline"
            >
              {personName(contact)}
            </Link>
            <ContactStatusBadge status={contact.status} />
          </li>
        ))}
      </Section>
      <Section title="Companies" icon={<Building2 />} empty={results.companies.length === 0}>
        {results.companies.map((company) => (
          <li key={company.id} className="py-2">
            <Link href={`/companies/${company.id}`} className="text-sm font-medium hover:underline">
              {company.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {company.domain ?? company.industry ?? "Not set"}
            </p>
          </li>
        ))}
      </Section>
      <Section title="Deals" icon={<Handshake />} empty={results.deals.length === 0}>
        {results.deals.map((deal) => (
          <li key={deal.id} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <Link
                href={`/deals/${deal.id}`}
                className="block truncate text-sm font-medium hover:underline"
              >
                {deal.title}
              </Link>
              <p className="text-xs text-muted-foreground tabular-nums">
                {formatCurrency(deal.value, deal.currency)}
              </p>
            </div>
            <DealStageBadge stage={deal.stage} />
          </li>
        ))}
      </Section>
    </div>
  );
}

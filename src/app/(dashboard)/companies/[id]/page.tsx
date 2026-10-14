import { Globe, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { ImageUpload } from "@/components/shared/image-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCompany, removeCompanyLogo, uploadCompanyLogo } from "@/features/companies/actions";
import { getCompany } from "@/features/companies/api";
import { CompanyFormDialog } from "@/features/companies/components/company-form-dialog";
import { listContacts } from "@/features/contacts/api";
import { ContactStatusBadge } from "@/features/contacts/components/contact-status-badge";
import { listDeals } from "@/features/deals/api";
import { DealList } from "@/features/deals/components/deal-list";
import { listUserOptions } from "@/features/users/api";
import { ApiError } from "@/lib/api-client";
import { formatDate, personName } from "@/lib/format";

async function loadCompany(id: string) {
  try {
    return await getCompany(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) notFound();
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/companies/[id]">): Promise<Metadata> {
  const { id } = await params;
  const company = await loadCompany(id);
  return { title: company.name };
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate text-right font-medium">{children}</span>
    </div>
  );
}

export default async function CompanyDetailPage({ params }: PageProps<"/companies/[id]">) {
  const { id } = await params;
  const company = await loadCompany(id);
  const [contacts, deals, users] = await Promise.all([
    listContacts({ page: 1, size: 50, company_id: id }),
    listDeals({ page: 1, size: 50, company_id: id }),
    listUserOptions(),
  ]);

  return (
    <>
      <PageHeader
        title={company.name}
        description={
          [company.industry, company.size && `${company.size} employees`]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        actions={
          <>
            <CompanyFormDialog
              company={company}
              users={users}
              trigger={
                <Button variant="outline">
                  <Pencil />
                  Edit
                </Button>
              }
            />
            <ConfirmDeleteButton
              variant="button"
              title={`Delete ${company.name}?`}
              action={deleteCompany.bind(null, company.id)}
              redirectTo="/companies"
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ImageUpload
              name={company.name}
              src={company.logo_url}
              shape="square"
              label="logo"
              onUpload={uploadCompanyLogo.bind(null, company.id)}
              onRemove={removeCompanyLogo.bind(null, company.id)}
              className="mb-5"
            />
            <Detail label="Domain">{company.domain ?? "—"}</Detail>
            <Detail label="Website">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:underline"
                >
                  <Globe className="size-3.5" />
                  Visit
                </a>
              ) : (
                "—"
              )}
            </Detail>
            <Detail label="Owner">{company.owner?.full_name ?? "—"}</Detail>
            <Detail label="Added">{formatDate(company.created_at)}</Detail>
            {company.notes ? (
              <p className="border-t pt-3 text-sm whitespace-pre-line text-muted-foreground">
                {company.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contacts ({contacts.total})</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No contacts yet.</p>
            ) : (
              <ul className="divide-y">
                {contacts.items.map((contact) => (
                  <li key={contact.id} className="flex items-center gap-3 py-2.5">
                    <EntityAvatar name={personName(contact)} src={contact.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="block truncate text-sm font-medium hover:underline"
                      >
                        {personName(contact)}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {contact.job_title ?? contact.email ?? "—"}
                      </span>
                    </div>
                    <ContactStatusBadge status={contact.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deals ({deals.total})</CardTitle>
          </CardHeader>
          <CardContent>
            <DealList deals={deals.items} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

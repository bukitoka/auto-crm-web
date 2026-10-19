import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ExportButton } from "@/components/shared/export-button";
import { ImportCsvDialog, type ImportField } from "@/components/shared/import-csv-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { SmartCaptureDialog } from "@/features/ai/components/smart-capture-dialog";
import { getCurrentUser } from "@/features/auth/api";
import { listCompanyOptions } from "@/features/companies/api";
import { importContacts } from "@/features/contacts/actions";
import { contactFiltersFromParams, listContacts } from "@/features/contacts/api";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { CONTACT_STATUSES } from "@/features/contacts/types";
import { canWriteCrm } from "@/features/users/roles";
import { enumOptions } from "@/lib/options";

export const metadata: Metadata = { title: "Contacts" };

const IMPORT_FIELDS: ImportField[] = [
  { name: "first_name", required: true, format: "Text, up to 100 characters.", example: "Maya" },
  { name: "last_name", format: "Text, up to 100 characters.", example: "Santoso" },
  { name: "email", format: "A valid email address.", example: "maya@example.com" },
  { name: "phone", format: "Text, up to 50 characters.", example: "+62 812 3456 7890" },
  { name: "job_title", format: "Text, up to 150 characters.", example: "Head of Sales" },
  {
    name: "status",
    format: "One of lead, prospect, customer, churned. Blank means lead.",
    example: "prospect",
  },
  { name: "source", format: "Text, up to 50 characters. Blank means manual.", example: "webinar" },
  { name: "tags", format: "Separate tags with semicolons.", example: "vip; newsletter" },
  { name: "company", format: "The exact name of a company already in the CRM.", example: "Acme" },
];

const IMPORT_RULES = [
  "A row whose email already exists is skipped.",
  "A company name that is not found leaves the contact without a company.",
  "Imported contacts are assigned to you.",
];

export default async function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  const params = await searchParams;

  const [user, contacts, companies] = await Promise.all([
    getCurrentUser(),
    listContacts(contactFiltersFromParams(params)),
    listCompanyOptions(),
  ]);
  const readOnly = !canWriteCrm(user);

  return (
    <>
      <PageHeader
        title="Contacts"
        description="People you're working with, from first touch to loyal customer."
        actions={
          <>
            <ExportButton entity="contacts" />
            {readOnly ? null : (
              <>
                <ImportCsvDialog
                  entity="contacts"
                  fields={IMPORT_FIELDS}
                  rules={IMPORT_RULES}
                  action={importContacts}
                />
                <SmartCaptureDialog companies={companies} />
                <ContactFormDialog
                  companies={companies}
                  trigger={
                    <Button>
                      <Plus />
                      New contact
                    </Button>
                  }
                />
              </>
            )}
          </>
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput placeholder="Search name, email…" />
        <ParamSelect
          param="status"
          allLabel="All statuses"
          options={enumOptions(CONTACT_STATUSES)}
        />
      </div>
      <ContactsTable contacts={contacts.items} companies={companies} readOnly={readOnly} />
      <PaginationBar
        pathname="/contacts"
        searchParams={params}
        page={contacts.page}
        size={contacts.size}
        total={contacts.total}
      />
    </>
  );
}

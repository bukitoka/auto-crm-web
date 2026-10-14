import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { SmartCaptureDialog } from "@/features/ai/components/smart-capture-dialog";
import { listCompanyOptions } from "@/features/companies/api";
import { contactFiltersFromParams, listContacts } from "@/features/contacts/api";
import { ContactFormDialog } from "@/features/contacts/components/contact-form-dialog";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { CONTACT_STATUSES } from "@/features/contacts/types";
import { listUserOptions } from "@/features/users/api";
import { enumOptions } from "@/lib/options";

export const metadata: Metadata = { title: "Contacts" };

export default async function ContactsPage({ searchParams }: PageProps<"/contacts">) {
  const params = await searchParams;

  const [contacts, companies, users] = await Promise.all([
    listContacts(contactFiltersFromParams(params)),
    listCompanyOptions(),
    listUserOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Contacts"
        description="People you're working with, from first touch to loyal customer."
        actions={
          <>
            <SmartCaptureDialog companies={companies} users={users} />
            <ContactFormDialog
              companies={companies}
              users={users}
              trigger={
                <Button>
                  <Plus />
                  New contact
                </Button>
              }
            />
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
      <ContactsTable contacts={contacts.items} companies={companies} users={users} />
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

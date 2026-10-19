import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ExportButton } from "@/components/shared/export-button";
import { ImportCsvDialog, type ImportField } from "@/components/shared/import-csv-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/api";
import { importCompanies } from "@/features/companies/actions";
import { listCompanies } from "@/features/companies/api";
import { CompaniesTable } from "@/features/companies/components/companies-table";
import { CompanyFormDialog } from "@/features/companies/components/company-form-dialog";
import { canWriteCrm } from "@/features/users/roles";
import { getListParams, getSortParams } from "@/lib/search-params";

const IMPORT_FIELDS: ImportField[] = [
  { name: "name", required: true, format: "Text, up to 200 characters.", example: "Acme" },
  { name: "domain", format: "Text, up to 255 characters.", example: "acme.com" },
  { name: "industry", format: "Text, up to 100 characters.", example: "Logistics" },
  { name: "size", format: "Text, up to 50 characters.", example: "11-50" },
  { name: "website", format: "Text, up to 255 characters.", example: "https://acme.com" },
  { name: "notes", format: "Free text." },
];

const IMPORT_RULES = [
  "A row whose name already exists is skipped.",
  "Imported companies are assigned to you.",
];

export const metadata: Metadata = { title: "Companies" };

export default async function CompaniesPage({ searchParams }: PageProps<"/companies">) {
  const params = await searchParams;
  const [user, companies] = await Promise.all([
    getCurrentUser(),
    listCompanies({ ...getListParams(params), ...getSortParams(params) }),
  ]);
  const readOnly = !canWriteCrm(user);

  return (
    <>
      <PageHeader
        title="Companies"
        description="Organizations your contacts belong to."
        actions={
          <>
            <ExportButton entity="companies" />
            {readOnly ? null : (
              <>
                <ImportCsvDialog
                  entity="companies"
                  fields={IMPORT_FIELDS}
                  rules={IMPORT_RULES}
                  action={importCompanies}
                />
                <CompanyFormDialog
                  trigger={
                    <Button>
                      <Plus />
                      New company
                    </Button>
                  }
                />
              </>
            )}
          </>
        }
      />
      <SearchInput placeholder="Search companies…" />
      <CompaniesTable companies={companies.items} readOnly={readOnly} />
      <PaginationBar
        pathname="/companies"
        searchParams={params}
        page={companies.page}
        size={companies.size}
        total={companies.total}
      />
    </>
  );
}

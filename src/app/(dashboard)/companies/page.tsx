import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ExportButton } from "@/components/shared/export-button";
import { ImportCsvDialog } from "@/components/shared/import-csv-dialog";
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
                  columns={["name", "domain", "industry", "size", "website", "notes"]}
                  note="Names that already exist are skipped."
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

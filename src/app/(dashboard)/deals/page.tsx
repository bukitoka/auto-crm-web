import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { listCompanyOptions } from "@/features/companies/api";
import { listContactOptions } from "@/features/contacts/api";
import { dealsQueryFromParams, listDeals, listStages } from "@/features/deals/api";
import { DealFormDialog } from "@/features/deals/components/deal-form-dialog";
import { DealsCanvas } from "@/features/deals/components/deals-canvas";
import { DealsTable } from "@/features/deals/components/deals-table";
import { DealsViewToggle } from "@/features/deals/components/deals-view-toggle";
import { listUserOptions } from "@/features/users/api";
import { toOptions } from "@/lib/options";

export const metadata: Metadata = { title: "Deals" };

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const params = await searchParams;
  const { view, filters } = dealsQueryFromParams(params);

  const [deals, stages, companies, contacts, users] = await Promise.all([
    listDeals(filters),
    listStages(),
    listCompanyOptions(),
    listContactOptions(),
    listUserOptions(),
  ]);

  return (
    <>
      <PageHeader
        title="Deals"
        description="Track opportunities through your pipeline."
        actions={
          <DealFormDialog
            stages={stages}
            companies={companies}
            contacts={contacts}
            users={users}
            trigger={
              <Button>
                <Plus />
                New deal
              </Button>
            }
          />
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput placeholder="Search deals…" />
        {view === "table" ? (
          <ParamSelect
            param="stage_id"
            allLabel="All stages"
            options={toOptions(stages, (s) => s.name)}
          />
        ) : null}
        <div className="sm:ml-auto">
          <DealsViewToggle view={view} />
        </div>
      </div>
      {view === "board" ? (
        <>
          <DealsCanvas deals={deals.items} stages={stages} />
          {deals.total > deals.items.length ? (
            <p className="text-sm text-muted-foreground">
              Showing {deals.items.length} of {deals.total} deals. Use search or the table view to
              find the rest.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <DealsTable deals={deals.items} />
          <PaginationBar
            pathname="/deals"
            searchParams={params}
            page={deals.page}
            size={deals.size}
            total={deals.total}
          />
        </>
      )}
    </>
  );
}

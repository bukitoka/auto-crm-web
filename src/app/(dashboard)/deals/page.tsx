import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ExportButton } from "@/components/shared/export-button";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/api";
import { listCompanyOptions } from "@/features/companies/api";
import { listContactOptions } from "@/features/contacts/api";
import { dealsQueryFromParams, listDeals, listStages } from "@/features/deals/api";
import { DealFormDialog } from "@/features/deals/components/deal-form-dialog";
import { DealsCanvas } from "@/features/deals/components/deals-canvas";
import { DealsTable } from "@/features/deals/components/deals-table";
import { DealsViewToggle } from "@/features/deals/components/deals-view-toggle";
import { PipelineEditor } from "@/features/deals/components/pipeline-editor";
import { canManageWorkspace, canWriteCrm } from "@/features/users/roles";
import { toOptions } from "@/lib/options";

export const metadata: Metadata = { title: "Deals" };

export default async function DealsPage({ searchParams }: PageProps<"/deals">) {
  const params = await searchParams;
  const { view, filters } = dealsQueryFromParams(params);

  const [user, deals, stages, companies, contacts] = await Promise.all([
    getCurrentUser(),
    listDeals(filters),
    listStages(),
    listCompanyOptions(),
    listContactOptions(),
  ]);
  const readOnly = !canWriteCrm(user);
  const canEditPipeline = view === "board" && canManageWorkspace(user);

  return (
    <>
      <PageHeader
        title="Deals"
        description="Track opportunities through your pipeline."
        actions={
          readOnly ? null : (
            <DealFormDialog
              stages={stages}
              companies={companies}
              contacts={contacts}
              trigger={
                <Button>
                  <Plus />
                  New deal
                </Button>
              }
            />
          )
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
        <div className="flex items-center gap-2 sm:ml-auto">
          {canEditPipeline ? <PipelineEditor stages={stages} /> : null}
          <ExportButton entity="deals" />
          <DealsViewToggle view={view} />
        </div>
      </div>
      {view === "board" ? (
        <>
          <DealsCanvas
            deals={deals.items}
            stages={stages}
            canEditPipeline={canEditPipeline}
            readOnly={readOnly}
          />
          {deals.total > deals.items.length ? (
            <p className="text-sm text-muted-foreground">
              Showing {deals.items.length} of {deals.total} deals. Use search or the table view to
              find the rest.
            </p>
          ) : null}
        </>
      ) : (
        <>
          <DealsTable deals={deals.items} readOnly={readOnly} />
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

import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ExportButton } from "@/components/shared/export-button";
import { PageHeader } from "@/components/shared/page-header";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { ParamSelect } from "@/components/shared/param-select";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/api";
import { listContactOptions } from "@/features/contacts/api";
import { listDealOptions } from "@/features/deals/api";
import { listTasks, taskFiltersFromParams } from "@/features/tasks/api";
import { taskStatusOptions } from "@/features/tasks/components/task-badges";
import { TaskFormDialog } from "@/features/tasks/components/task-form-dialog";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { canWriteCrm } from "@/features/users/roles";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const params = await searchParams;

  const [user, tasks, contacts, deals] = await Promise.all([
    getCurrentUser(),
    listTasks(taskFiltersFromParams(params)),
    listContactOptions(),
    listDealOptions(),
  ]);
  const options = { contacts, deals };
  const readOnly = !canWriteCrm(user);

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Follow-ups and to-dos across your contacts and deals."
        actions={
          <>
            <ExportButton entity="tasks" />
            {readOnly ? null : (
              <TaskFormDialog
                {...options}
                trigger={
                  <Button>
                    <Plus />
                    New task
                  </Button>
                }
              />
            )}
          </>
        }
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchInput placeholder="Search tasks…" />
        <ParamSelect param="status" allLabel="All statuses" options={taskStatusOptions} />
        <ParamSelect
          param="overdue"
          allLabel="Any due date"
          options={[{ value: "true", label: "Overdue only" }]}
        />
      </div>
      <TasksTable tasks={tasks.items} options={options} readOnly={readOnly} />
      <PaginationBar
        pathname="/tasks"
        searchParams={params}
        page={tasks.page}
        size={tasks.size}
        total={tasks.total}
      />
    </>
  );
}

import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ForbiddenState } from "@/components/shared/forbidden-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/api";
import { listTeam } from "@/features/users/api";
import { AdminFormDialog } from "@/features/users/components/admin-form-dialog";
import { TeamTable } from "@/features/users/components/team-table";
import { canManageAdmins } from "@/features/users/roles";

export const metadata: Metadata = { title: "Admins" };

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!canManageAdmins(user)) {
    return <ForbiddenState description="Only the super admin manages admin accounts." />;
  }

  const admins = await listTeam();

  return (
    <>
      <PageHeader
        title="Admins"
        description="Create admin accounts and switch them on or off. Each admin works on their own records."
        actions={
          <AdminFormDialog
            trigger={
              <Button>
                <Plus />
                New admin
              </Button>
            }
          />
        }
      />
      <TeamTable users={admins} />
    </>
  );
}

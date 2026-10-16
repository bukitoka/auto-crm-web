import { ShieldAlert } from "lucide-react";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getCurrentUser } from "@/features/auth/api";
import { listTeam } from "@/features/users/api";
import { TeamTable } from "@/features/users/components/team-table";
import { isAdmin } from "@/features/users/roles";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const user = await getCurrentUser();
  if (!isAdmin(user)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="Admins only"
        description="Ask a workspace admin to manage the team."
      />
    );
  }

  const users = await listTeam();

  return (
    <>
      <PageHeader
        title="Team"
        description={
          user.is_super_admin
            ? "Change roles and deactivate accounts. New teammates sign up on the register page."
            : "Deactivate member accounts. Only the super admin can change roles or manage admins."
        }
      />
      <TeamTable users={users} currentUser={user} />
    </>
  );
}

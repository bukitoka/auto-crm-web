import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { canManageUser } from "../roles";
import type { User } from "../types";
import { UserActiveSwitch, UserRoleSelect } from "./user-controls";

/** Controls are disabled where `currentUser` lacks the rights. */
export function TeamTable({ users, currentUser }: { users: User[]; currentUser: User }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const canManage = canManageUser(currentUser, user);
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <EntityAvatar name={user.full_name} src={user.avatar_url} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-medium">
                        {user.full_name}
                        {user.id === currentUser.id ? <Badge variant="secondary">You</Badge> : null}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {/* Only the super admin can grant or revoke the admin role. */}
                  <UserRoleSelect
                    id={user.id}
                    role={user.role}
                    disabled={!canManage || !currentUser.is_super_admin}
                  />
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {formatDate(user.created_at)}
                </TableCell>
                <TableCell>
                  <UserActiveSwitch id={user.id} isActive={user.is_active} disabled={!canManage} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

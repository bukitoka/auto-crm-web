import { Pencil, Plus, UserCog } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import type { User } from "../types";
import { AdminActiveSwitch } from "./admin-active-switch";
import { AdminEditDialog } from "./admin-edit-dialog";
import { AdminFormDialog } from "./admin-form-dialog";

export function TeamTable({ users }: { users: User[] }) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={UserCog}
        title="No admins yet"
        description="Only you can create admin accounts. Add the first one so someone can start working on contacts and deals."
        action={
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
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-20">Active</TableHead>
            <TableHead className="w-16">
              <span className="sr-only">Edit</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityAvatar name={user.full_name} src={user.avatar_url} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatDate(user.created_at)}
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "secondary" : "outline"}>
                  {user.is_active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                <AdminActiveSwitch id={user.id} name={user.full_name} isActive={user.is_active} />
              </TableCell>
              <TableCell>
                <AdminEditDialog
                  user={user}
                  trigger={
                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${user.full_name}`}>
                      <Pencil />
                    </Button>
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

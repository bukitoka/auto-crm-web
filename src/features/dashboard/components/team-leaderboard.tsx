import { EntityAvatar } from "@/components/shared/entity-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/format";
import type { TeamMemberStats } from "../types";

/** Active users ranked by value won this month (the API sorts). */
export function TeamLeaderboard({ team }: { team: TeamMemberStats[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Owner</TableHead>
          <TableHead className="text-right">Won this month</TableHead>
          <TableHead className="text-right">Open deals</TableHead>
          <TableHead className="text-right">Open tasks</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {team.map((member) => (
          <TableRow key={member.user.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <EntityAvatar
                  name={member.user.full_name}
                  src={member.user.avatar_url}
                  className="size-7"
                />
                <span className="truncate font-medium">{member.user.full_name}</span>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(member.won_this_month_value)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatCurrency(member.open_deals_value)}
            </TableCell>
            <TableCell className="text-right tabular-nums">{member.open_tasks}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

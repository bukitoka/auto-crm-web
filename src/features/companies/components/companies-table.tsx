import { Building2, Pencil } from "lucide-react";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button";
import { EmptyState } from "@/components/shared/empty-state";
import { EntityAvatar } from "@/components/shared/entity-avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserRef } from "@/features/users/types";
import { deleteCompany } from "../actions";
import type { Company } from "../types";
import { CompanyFormDialog } from "./company-form-dialog";

export function CompaniesTable({ companies, users }: { companies: Company[]; users: UserRef[] }) {
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No companies found"
        description="Try a different search, or add your first company."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Industry</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="hidden lg:table-cell">Owner</TableHead>
            <TableHead className="w-24">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityAvatar name={company.name} src={company.logo_url} shape="square" />
                  <div className="min-w-0">
                    <Link href={`/companies/${company.id}`} className="font-medium hover:underline">
                      {company.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{company.domain ?? "—"}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{company.industry ?? "—"}</TableCell>
              <TableCell className="hidden md:table-cell">{company.size ?? "—"}</TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {company.owner?.full_name ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <CompanyFormDialog
                    company={company}
                    users={users}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit company">
                        <Pencil />
                      </Button>
                    }
                  />
                  <ConfirmDeleteButton
                    title={`Delete ${company.name}?`}
                    description="Contacts and deals stay, but lose the link to this company."
                    action={deleteCompany.bind(null, company.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { Pencil, Users } from "lucide-react";
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
import { AiScoreBadge } from "@/features/ai/components/ai-score-badge";
import type { CompanyRef } from "@/features/companies/types";
import type { UserRef } from "@/features/users/types";
import { personName } from "@/lib/format";
import { deleteContact } from "../actions";
import type { Contact } from "../types";
import { ContactFormDialog } from "./contact-form-dialog";
import { ContactStatusBadge } from "./contact-status-badge";

type ContactsTableProps = {
  contacts: Contact[];
  companies: CompanyRef[];
  users: UserRef[];
};

export function ContactsTable({ contacts, companies, users }: ContactsTableProps) {
  if (contacts.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No contacts found"
        description="Try a different search or filter, or add your first contact."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">AI score</TableHead>
            <TableHead className="hidden lg:table-cell">Owner</TableHead>
            <TableHead className="w-24 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <EntityAvatar name={personName(contact)} src={contact.avatar_url} />
                  <div className="min-w-0">
                    <Link href={`/contacts/${contact.id}`} className="font-medium hover:underline">
                      {personName(contact)}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      {contact.email ?? contact.job_title ?? "—"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {contact.company ? (
                  <Link href={`/companies/${contact.company.id}`} className="hover:underline">
                    {contact.company.name}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <ContactStatusBadge status={contact.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <AiScoreBadge score={contact.ai_score} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {contact.owner?.full_name ?? "—"}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <ContactFormDialog
                    contact={contact}
                    companies={companies}
                    users={users}
                    trigger={
                      <Button variant="ghost" size="icon-sm" aria-label="Edit contact">
                        <Pencil />
                      </Button>
                    }
                  />
                  <ConfirmDeleteButton
                    title={`Delete ${personName(contact)}?`}
                    description="The contact and its activities will be removed."
                    action={deleteContact.bind(null, contact.id)}
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

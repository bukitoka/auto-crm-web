import { Badge } from "@/components/ui/badge";
import type { ContactStatus } from "../types";

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

const variants: Record<ContactStatus, BadgeVariant> = {
  lead: "info",
  prospect: "warning",
  customer: "success",
  churned: "secondary",
};

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}

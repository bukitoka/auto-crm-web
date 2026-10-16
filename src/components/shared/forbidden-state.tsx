import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/constants";

/** Shown in place of a page the current role cannot open. */
export function ForbiddenState({ description }: { description: string }) {
  return (
    <EmptyState
      icon={ShieldAlert}
      title="You don't have access to this page"
      description={description}
      action={
        <Button asChild variant="outline">
          <Link href={HOME_PATH}>Back to home</Link>
        </Button>
      }
    />
  );
}

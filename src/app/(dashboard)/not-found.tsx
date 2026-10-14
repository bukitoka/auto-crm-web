import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/constants";

export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={FileQuestion}
      title="Not found"
      description="This record does not exist or was deleted."
      action={
        <Button asChild variant="outline">
          <Link href={HOME_PATH}>Back to home</Link>
        </Button>
      }
    />
  );
}

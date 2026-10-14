import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <EmptyState
        icon={FileQuestion}
        title="Page not found"
        description="The page you are looking for does not exist or was removed."
        action={
          <Button asChild>
            <Link href={HOME_PATH}>Back to home</Link>
          </Button>
        }
      />
    </main>
  );
}

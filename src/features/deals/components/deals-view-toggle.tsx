import { KanbanSquare, Table2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DealsView } from "../types";

export function DealsViewToggle({ view }: { view: DealsView }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border p-0.75">
      <Button
        size="sm"
        className="h-full"
        variant={view === "board" ? "secondary" : "ghost"}
        asChild
      >
        <Link href="/deals?view=board" aria-current={view === "board" ? "page" : undefined}>
          <KanbanSquare />
          Board
        </Link>
      </Button>
      <Button
        size="sm"
        className="h-full"
        variant={view === "table" ? "secondary" : "ghost"}
        asChild
      >
        <Link href="/deals?view=table" aria-current={view === "table" ? "page" : undefined}>
          <Table2 />
          Table
        </Link>
      </Button>
    </div>
  );
}

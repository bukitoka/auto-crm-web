import { KanbanSquare, Table2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DealsView } from "../types";

export function DealsViewToggle({ view }: { view: DealsView }) {
  return (
    <div className="inline-flex rounded-full border p-0.5">
      <Button size="sm" variant={view === "board" ? "secondary" : "ghost"} asChild>
        <Link href="/deals?view=board" aria-current={view === "board" ? "page" : undefined}>
          <KanbanSquare />
          Board
        </Link>
      </Button>
      <Button size="sm" variant={view === "table" ? "secondary" : "ghost"} asChild>
        <Link href="/deals?view=table" aria-current={view === "table" ? "page" : undefined}>
          <Table2 />
          Table
        </Link>
      </Button>
    </div>
  );
}

import { KanbanSquare, Table2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { DealsView } from "../types"

const tabClassName =
  "h-full aria-[current=page]:bg-sidebar-primary aria-[current=page]:text-sidebar-primary-foreground aria-[current=page]:hover:bg-sidebar-primary aria-[current=page]:hover:text-sidebar-primary-foreground"

export function DealsViewToggle({ view }: { view: DealsView }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border bg-card p-0.75">
      <Button size="sm" className={tabClassName} variant="ghost" asChild>
        <Link href="/deals?view=board" aria-current={view === "board" ? "page" : undefined}>
          <KanbanSquare />
          Board
        </Link>
      </Button>
      <Button size="sm" className={tabClassName} variant="ghost" asChild>
        <Link href="/deals?view=table" aria-current={view === "table" ? "page" : undefined}>
          <Table2 />
          Table
        </Link>
      </Button>
    </div>
  )
}

import { cn } from "cn"
import Image from "next/image"

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <Image src="/logo.svg" alt="" width={32} height={32} className="size-8 shrink-0" />
      <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
        Auto CRM
      </span>
    </span>
  )
}

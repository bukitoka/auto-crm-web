import { cn } from "cn"

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2.5", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        fill="none"
        className="size-8 shrink-0 text-primary"
      >
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M8 24 14.5 8Q16 5 17.5 8L24 24h-4l-1.5-3.5h-5L12 24Zm8-14c-.5 3-1.2 3.8-3 4.5 1.8.7 2.5 1.5 3 4.5.5-3 1.2-3.8 3-4.5-1.8-.7-2.5-1.5-3-4.5Z"
        />
      </svg>
      <span className="truncate text-base font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
        Auto CRM
      </span>
    </span>
  )
}

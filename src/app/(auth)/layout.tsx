import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Brand } from "@/components/shared/brand"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section
        className="relative isolate hidden h-svh flex-col justify-between overflow-hidden bg-linear-to-br from-brand-900 via-brand-800 to-brand-600 p-10 text-brand-50 lg:sticky lg:top-0 lg:flex xl:p-16"
        aria-label="About Auto CRM"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={640}
          height={640}
          className="pointer-events-none absolute -right-32 bottom-0 -z-10 w-full max-w-2xl opacity-[0.07] brightness-0 invert"
        />
        <Link
          href="/login"
          aria-label="Auto CRM home"
          className="w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          <Brand className="text-brand-50 [&_svg]:text-brand-50" />
        </Link>
        <div className="my-16 max-w-lg space-y-8">
          <p className="text-5xl font-medium leading-tight tracking-tight text-balance xl:text-6xl 2xl:text-7xl">
            From first contact.
            <br />
            <span className="text-brand-200">To what’s next.</span>
          </p>
          <p className="max-w-sm text-base leading-relaxed text-brand-100">
            Keep the conversation, the deal and the next follow-up together. One place for your team
            to pick up where you left off.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brand-50/25 pt-6 text-sm text-brand-100">
          <span>Contacts</span>
          <span aria-hidden="true">/</span>
          <span>Pipeline</span>
          <span aria-hidden="true">/</span>
          <span>Follow-ups</span>
        </div>
      </section>
      <section
        className="flex min-h-svh min-w-0 flex-col px-6 sm:px-10 xl:px-16"
        aria-label="Workspace access"
      >
        <header className="flex min-h-24 items-center justify-between gap-4 py-6">
          <Link
            href="/login"
            aria-label="Auto CRM home"
            className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <Brand />
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center py-10 sm:py-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <footer className="py-6 text-center text-xs text-muted-foreground">
          Auto CRM · Your team’s workspace
        </footer>
      </section>
    </main>
  )
}

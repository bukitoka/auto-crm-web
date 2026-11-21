import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Brand } from "@/components/shared/brand"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section
        className="relative isolate hidden h-svh flex-col overflow-hidden bg-brand-900 p-10 text-brand-50 lg:sticky lg:top-0 lg:flex xl:p-16"
        aria-label="About Auto CRM"
      >
        <div aria-hidden="true" className="auth-photo absolute inset-0 -z-20 bg-cover bg-center" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-brand-900 via-brand-900/30 via-55% to-brand-900/85"
        />
        <Link
          href="/login"
          aria-label="Auto CRM home"
          className="w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          <Brand className="text-brand-50 [&_svg]:text-brand-50" />
        </Link>
        <div className="mt-auto max-w-lg pt-16">
          <p className="max-w-md text-4xl font-medium tracking-tight text-balance xl:text-5xl">
            Contacts, deals, and follow-ups in one workspace.
          </p>
          <a
            href="https://unsplash.com/photos/a-person-walks-up-concrete-stairs-with-strong-shadows-TppXG0qVNjI"
            className="mt-8 inline-block text-xs text-brand-100 underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
          >
            Photo by Onur Can Elma
          </a>
        </div>
      </section>
      <section
        className="flex min-h-svh min-w-0 flex-col px-6 sm:px-10 xl:px-16"
        aria-label="Workspace access"
      >
        <header className="flex min-h-20 items-center justify-between gap-4 py-6">
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
        <div className="flex flex-1 items-center justify-center pt-8 pb-20 sm:py-16">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </section>
    </main>
  )
}

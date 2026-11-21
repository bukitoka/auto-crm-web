import Image from "next/image"
import Link from "next/link"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Brand } from "@/components/shared/brand"

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <section
        className="relative isolate hidden h-svh flex-col overflow-hidden bg-linear-to-br from-brand-900 to-brand-600 p-10 text-brand-50 lg:sticky lg:top-0 lg:flex xl:p-16"
        aria-label="About Auto CRM"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={640}
          height={640}
          className="pointer-events-none absolute -bottom-28 -right-36 -z-10 w-[110%] max-w-3xl opacity-[0.12] brightness-0 invert"
        />
        <Link
          href="/login"
          aria-label="Auto CRM home"
          className="w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
        >
          <Brand className="text-brand-50 [&_svg]:text-brand-50" />
        </Link>
        <div className="mt-auto max-w-lg pb-12">
          <p className="border-t border-brand-100/25 pt-6 text-3xl font-medium tracking-tight text-balance xl:text-4xl">
            Contacts, deals, and follow-ups in one workspace.
          </p>
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

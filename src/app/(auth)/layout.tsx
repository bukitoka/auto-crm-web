import { Sparkles } from "lucide-react";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-6 p-6 md:p-10">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          Auto CRM
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
      {/* Brand panel: an inset rounded card rather than a full-height color block. */}
      <div className="hidden p-3 lg:flex">
        <div className="relative flex flex-1 flex-col justify-end overflow-hidden rounded-lg bg-teal-950 p-10 text-teal-50">
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-teal-700/50 blur-3xl" />
          <div className="absolute bottom-10 -left-20 size-80 rounded-full bg-teal-400/25 blur-3xl" />
          <blockquote className="relative space-y-3">
            <p className="text-2xl font-medium text-balance">
              Score leads, draft follow-ups and automate the busywork — so your team can focus on
              relationships.
            </p>
            <footer className="text-sm text-teal-200">AI-assisted CRM · DeepSeek · n8n</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

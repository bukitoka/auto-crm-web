"use client"

import {
  AlarmClock,
  ArrowUpRight,
  CalendarCheck,
  Gauge,
  HandCoins,
  type LucideIcon,
  Mail,
  PencilLine,
  PhoneCall,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { colorTones } from "@/lib/color-tones"
import { cn } from "@/lib/utils"
import { greeting } from "../context"
import { ChatThread } from "./chat-thread"

type Idea = {
  title: string
  prompt: string
  description: string
  icon: LucideIcon
  /** "send" asks right away; "fill" puts the text in the box to finish (e.g. a name). */
  mode: "send" | "fill"
  tone: keyof typeof colorTones
}

const IDEAS: Idea[] = [
  {
    title: "Plan my day",
    description: "Find the follow-ups that need you first.",
    prompt: "What should I focus on today? Check my overdue and upcoming tasks.",
    icon: CalendarCheck,
    mode: "send",
    tone: "primary",
  },
  {
    title: "Pipeline check",
    description: "See where deals stand and what needs attention.",
    prompt:
      "Chart my pipeline by stage and my won deals over the last 6 months. Which deals need attention?",
    icon: TrendingUp,
    mode: "send",
    tone: "success",
  },
  {
    title: "Add a follow-up",
    description: "Set a reminder so you don’t lose touch.",
    prompt: "Create a follow-up task for ",
    icon: AlarmClock,
    mode: "fill",
    tone: "warning",
  },
  {
    title: "Log a call",
    description: "Save the details while they’re fresh.",
    prompt: "Log a call with ",
    icon: PhoneCall,
    mode: "fill",
    tone: "info",
  },
  {
    title: "Draft an email",
    description: "Find the right words for your next check-in.",
    prompt: "Draft a friendly check-in email to ",
    icon: Mail,
    mode: "fill",
    tone: "primary",
  },
  {
    title: "Who to call first",
    description: "Review your newest leads and pick a starting point.",
    prompt: "Score my newest leads and tell me who to call first.",
    icon: Gauge,
    mode: "send",
    tone: "info",
  },
]

export type TodaySnapshot = {
  overdueTasks: number
  openPipeline: string
  newLeads: number
}

type AssistantHomeProps = {
  firstName: string
  snapshot: TodaySnapshot | null
}

/** Sending the first message creates a conversation and navigates to /assistant/<id>. */
export function AssistantHome({ firstName, snapshot }: AssistantHomeProps) {
  const router = useRouter()
  // The greeting depends on the viewer's clock, so it is computed in the browser.
  const [hello] = useState(() => greeting())

  return (
    <ChatThread
      conversationId={null}
      onTurn={(turn) => router.replace(`/assistant/${turn.conversation.id}`)}
      renderEmpty={(composer, send, fill) => (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-7 px-4 py-8 sm:px-6 sm:py-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </span>
              <div className="space-y-2">
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {hello}, {firstName}
                </p>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  What would you like to work on?
                </h1>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
                  Plan your next follow-up, check a deal, or tell me what needs doing.
                </p>
              </div>
            </div>

            {composer}

            {snapshot ? (
              <div className="flex flex-wrap justify-center gap-2">
                <SnapshotChip
                  icon={AlarmClock}
                  label={`${snapshot.overdueTasks} overdue ${snapshot.overdueTasks === 1 ? "task" : "tasks"}`}
                  alert={snapshot.overdueTasks > 0}
                  onClick={() => send("Which tasks are overdue, and what should I do about them?")}
                />
                <SnapshotChip
                  icon={HandCoins}
                  label={`${snapshot.openPipeline} open pipeline`}
                  onClick={() => send("Summarize my open pipeline by stage.")}
                />
                <SnapshotChip
                  icon={UserRoundPlus}
                  label={`${snapshot.newLeads} new ${snapshot.newLeads === 1 ? "lead" : "leads"} this month`}
                  onClick={() => send("Who are this month's new leads?")}
                />
              </div>
            ) : null}

            <section aria-labelledby="assistant-shortcuts" className="space-y-3">
              <h2 id="assistant-shortcuts" className="text-sm font-medium text-muted-foreground">
                A few ways to get started
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {IDEAS.map((idea) => (
                  <button
                    key={idea.title}
                    type="button"
                    onClick={() => (idea.mode === "send" ? send(idea.prompt) : fill(idea.prompt))}
                    className="group flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors outline-none hover:border-primary/40 hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                    aria-describedby={`idea-${idea.title.replaceAll(" ", "-")}`}
                  >
                    <span className="flex w-full items-center justify-between">
                      <span
                        className={cn(
                          "flex size-9 items-center justify-center rounded-md",
                          colorTones[idea.tone],
                        )}
                      >
                        <idea.icon aria-hidden className="size-4.5" />
                      </span>
                      {idea.mode === "send" ? (
                        <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
                      ) : (
                        <PencilLine aria-hidden className="size-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="space-y-1">
                      <span className="block text-sm font-medium">{idea.title}</span>
                      <span
                        id={`idea-${idea.title.replaceAll(" ", "-")}`}
                        className="mt-1 block text-xs leading-relaxed text-muted-foreground"
                      >
                        {idea.description}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    />
  )
}

function SnapshotChip({
  icon: Icon,
  label,
  alert = false,
  onClick,
}: {
  icon: LucideIcon
  label: string
  alert?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors outline-none hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50",
        alert ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-card",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  )
}

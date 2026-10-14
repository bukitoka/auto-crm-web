"use client";

import {
  AlarmClock,
  CalendarCheck,
  Gauge,
  HandCoins,
  type LucideIcon,
  Mail,
  PhoneCall,
  Sparkles,
  TrendingUp,
  UserRoundPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { greeting } from "../context";
import { ChatThread } from "./chat-thread";

type Idea = {
  title: string;
  prompt: string;
  icon: LucideIcon;
  /** "send" asks right away; "fill" puts the text in the box to finish (e.g. a name). */
  mode: "send" | "fill";
  tone: string;
};

/** Starter ideas across the CRM modules. Tones use the semantic status colors. */
const IDEAS: Idea[] = [
  {
    title: "Plan my day",
    prompt: "What should I focus on today? Check my overdue and upcoming tasks.",
    icon: CalendarCheck,
    mode: "send",
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Pipeline check",
    prompt: "How is my pipeline looking this month? Which deals need attention?",
    icon: TrendingUp,
    mode: "send",
    tone: "bg-success/10 text-success",
  },
  {
    title: "Add a follow-up",
    prompt: "Create a follow-up task for ",
    icon: AlarmClock,
    mode: "fill",
    tone: "bg-warning/10 text-warning",
  },
  {
    title: "Log a call",
    prompt: "Log a call with ",
    icon: PhoneCall,
    mode: "fill",
    tone: "bg-info/10 text-info",
  },
  {
    title: "Draft an email",
    prompt: "Draft a friendly check-in email to ",
    icon: Mail,
    mode: "fill",
    tone: "bg-primary/10 text-primary",
  },
  {
    title: "Who to call first",
    prompt: "Score my newest leads and tell me who to call first.",
    icon: Gauge,
    mode: "send",
    tone: "bg-destructive/10 text-destructive",
  },
];

export type TodaySnapshot = {
  overdueTasks: number;
  openPipeline: string;
  newLeads: number;
};

type AssistantHomeProps = {
  firstName: string;
  snapshot: TodaySnapshot | null;
};

/**
 * The home page: "What are you going to do today?". Sending the first message starts a
 * saved conversation and moves to its page (/assistant/<id>).
 */
export function AssistantHome({ firstName, snapshot }: AssistantHomeProps) {
  const router = useRouter();
  // The greeting depends on the viewer's clock, so it is computed in the browser.
  const [hello] = useState(() => greeting());

  return (
    <ChatThread
      conversationId={null}
      onTurn={(turn) => router.replace(`/assistant/${turn.conversation.id}`)}
      renderEmpty={(composer, send, fill) => (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 px-4 py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-primary to-info text-primary-foreground">
                <Sparkles className="size-6" />
              </span>
              <div className="space-y-2">
                <p className="text-muted-foreground" suppressHydrationWarning>
                  {hello}, {firstName}
                </p>
                <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                  What are you going to do today?
                </h1>
              </div>
            </div>

            {composer}

            {snapshot ? (
              <div className="flex flex-wrap justify-center gap-2">
                <SnapshotChip
                  icon={AlarmClock}
                  label={`${snapshot.overdueTasks} overdue tasks`}
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
                  label={`${snapshot.newLeads} new leads this month`}
                  onClick={() => send("Who are this month's new leads?")}
                />
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {IDEAS.map((idea) => (
                <button
                  key={idea.title}
                  type="button"
                  onClick={() => (idea.mode === "send" ? send(idea.prompt) : fill(idea.prompt))}
                  className="group flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent/40"
                >
                  <span
                    className={cn("flex size-9 items-center justify-center rounded-md", idea.tone)}
                  >
                    <idea.icon className="size-4.5" />
                  </span>
                  <span className="space-y-1">
                    <span className="block text-sm font-medium">{idea.title}</span>
                    <span className="line-clamp-2 block text-xs text-muted-foreground">
                      {idea.prompt.trim()}
                      {idea.mode === "fill" ? "…" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
}

function SnapshotChip({
  icon: Icon,
  label,
  alert = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  alert?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50",
        alert ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-card",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

import type { RecordLinks } from "@/features/workspace/record-links"

export type EventColor = "teal" | "blue" | "amber" | "violet" | "rose"

export type CalendarEvent = RecordLinks & {
  id: string
  title: string
  color?: EventColor
  notes: string | null
  starts_at: string
  ends_at: string
}

export type CalendarEventInput = Omit<CalendarEvent, "id">

export type CalendarDeadline = {
  id: string
  title: string
  day: string
  kind: "task" | "deal"
}

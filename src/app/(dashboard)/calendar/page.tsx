import { addDays, addMonths, format, isValid, parse, startOfMonth } from "date-fns"
import type { Metadata } from "next"
import { z } from "zod"
import { PageHeader } from "@/components/shared/page-header"
import { Schedule } from "@/features/calendar/schedule"
import type { CalendarDeadline, CalendarEvent } from "@/features/calendar/types"
import { getRecordOptions } from "@/features/workspace/record-options"
import { ApiError, apiFetch } from "@/lib/api-client"
import { getParam } from "@/lib/search-params"

export const metadata: Metadata = { title: "Calendar" }

export default async function CalendarPage({ searchParams }: PageProps<"/calendar">) {
  const params = await searchParams
  const month = getParam(params, "month")
  const eventId = z.uuid().safeParse(getParam(params, "event"))
  const focused =
    !month && eventId.success
      ? await apiFetch<CalendarEvent>(`/calendar/events/${eventId.data}`).catch(
          (error: unknown) => {
            if (error instanceof ApiError && error.status === 404) return null
            throw error
          },
        )
      : null
  const now = new Date()
  const requested =
    month && /^\d{4}-\d{2}$/.test(month)
      ? parse(month, "yyyy-MM", now)
      : focused
        ? new Date(focused.starts_at)
        : now
  const start = startOfMonth(isValid(requested) ? requested : now)
  const nextMonth = addMonths(start, 1)
  const [events, deadlines, recordOptions] = await Promise.all([
    apiFetch<CalendarEvent[]>("/calendar/events", {
      query: {
        start: addDays(start, -2).toISOString(),
        end: addDays(nextMonth, 2).toISOString(),
      },
    }),
    apiFetch<CalendarDeadline[]>("/calendar/deadlines", {
      query: { start: format(start, "yyyy-MM-dd"), end: format(nextMonth, "yyyy-MM-dd") },
    }),
    getRecordOptions(),
  ])

  return (
    <>
      <PageHeader title="Calendar" description="Plan and manage your schedule." />
      <Schedule
        month={format(start, "yyyy-MM")}
        today={format(now, "yyyy-MM-dd")}
        events={events}
        deadlines={deadlines}
        recordOptions={recordOptions}
        initialSelection={focused ? format(new Date(focused.starts_at), "yyyy-MM-dd") : undefined}
      />
    </>
  )
}

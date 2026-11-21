"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { parseInput, runAction } from "@/lib/action-result"
import { apiFetch } from "@/lib/api-client"
import type { CalendarEventInput } from "./types"

const eventIdSchema = z.uuid()

export async function saveCalendarEvent(id: string | null, body: CalendarEventInput) {
  const parsed = parseInput(eventIdSchema.nullable(), id)
  if (!parsed.ok) return parsed
  const result = await runAction(() =>
    apiFetch<void>(parsed.data ? `/calendar/events/${parsed.data}` : "/calendar/events", {
      method: id ? "PUT" : "POST",
      body,
    }),
  )
  if (result.ok) revalidatePath("/calendar")
  return result
}

export async function deleteCalendarEvent(id: string) {
  const parsed = parseInput(eventIdSchema, id)
  if (!parsed.ok) return parsed
  const result = await runAction(() =>
    apiFetch<void>(`/calendar/events/${parsed.data}`, { method: "DELETE" }),
  )
  if (result.ok) revalidatePath("/calendar")
  return result
}

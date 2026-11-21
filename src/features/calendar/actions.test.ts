import { revalidatePath } from "next/cache"
import { expect, it, vi } from "vitest"
import { ApiError, apiFetch } from "@/lib/api-client"
import { deleteCalendarEvent, saveCalendarEvent } from "./actions"

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}))

const eventId = "01a1fda8-a11c-721e-bee0-9fc999b72228"

const body = {
  title: "Renewal call",
  notes: null,
  starts_at: "2026-11-21T06:00:00Z",
  ends_at: "2026-11-21T06:30:00Z",
}

it("creates and updates events, then revalidates the calendar", async () => {
  expect((await saveCalendarEvent(null, body)).ok).toBe(true)
  expect(apiFetch).toHaveBeenCalledWith("/calendar/events", { method: "POST", body })
  expect((await saveCalendarEvent(eventId, body)).ok).toBe(true)
  expect(apiFetch).toHaveBeenCalledWith(`/calendar/events/${eventId}`, { method: "PUT", body })
  expect(revalidatePath).toHaveBeenCalledTimes(2)
  expect(revalidatePath).toHaveBeenCalledWith("/calendar")
})

it("returns validation errors without revalidating", async () => {
  vi.mocked(apiFetch).mockRejectedValue(new ApiError(422, "Invalid time"))
  expect(await saveCalendarEvent(null, body)).toMatchObject({ ok: false, error: "Invalid time" })
  expect(revalidatePath).not.toHaveBeenCalled()
})

it("revalidates only when deletion succeeds", async () => {
  vi.mocked(apiFetch).mockRejectedValueOnce(new ApiError(404, "Event not found"))
  expect((await deleteCalendarEvent(eventId)).ok).toBe(false)
  expect(revalidatePath).not.toHaveBeenCalled()
  expect((await deleteCalendarEvent(eventId)).ok).toBe(true)
  expect(apiFetch).toHaveBeenCalledWith(`/calendar/events/${eventId}`, { method: "DELETE" })
  expect(revalidatePath).toHaveBeenCalledWith("/calendar")
})

it("rejects malformed event identifiers before sending requests", async () => {
  expect((await saveCalendarEvent("../users", body)).ok).toBe(false)
  expect((await deleteCalendarEvent("../users")).ok).toBe(false)
  expect(apiFetch).not.toHaveBeenCalled()
})

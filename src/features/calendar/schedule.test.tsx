import { screen, waitFor, within } from "@testing-library/react"
import { addDays, format, formatISO, setHours, setMinutes, startOfDay } from "date-fns"
import { expect, it, vi } from "vitest"
import { renderWithUser } from "@/test/render"
import { saveCalendarEvent } from "./actions"
import { Schedule } from "./schedule"

vi.mock("./actions", () => ({
  saveCalendarEvent: vi.fn(),
  deleteCalendarEvent: vi.fn(),
}))

it("shows events for the selected day and creates one in local time", async () => {
  vi.mocked(saveCalendarEvent).mockResolvedValue({ ok: true, data: undefined })
  const day = startOfDay(addDays(new Date(), 1))
  const { user } = renderWithUser(
    <Schedule
      today={format(new Date(), "yyyy-MM-dd")}
      month={format(day, "yyyy-MM")}
      events={[
        {
          id: "renewal",
          title: "Renewal call",
          color: "violet",
          notes: "Review pricing",
          starts_at: formatISO(setHours(day, 14)),
          ends_at: formatISO(setHours(day, 15)),
        },
      ]}
    />,
  )

  await user.click(
    screen.getByRole("button", { name: `${format(day, "EEEE, MMMM d, yyyy")}, 1 event` }),
  )
  const daySchedule = within(screen.getByRole("region", { name: "Selected day schedule" }))
  expect(daySchedule.getByText("Renewal call")).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Agenda" }))
  expect(screen.getByRole("button", { name: "Agenda" })).toHaveAttribute("aria-pressed", "true")
  expect(screen.getByRole("button", { name: "Edit Renewal call" })).toBeInTheDocument()
  await user.click(screen.getByRole("button", { name: "Duplicate Renewal call" }))
  const duplicate = within(screen.getByRole("dialog"))
  expect(duplicate.getByLabelText("Title")).toHaveValue("Renewal call")
  expect(duplicate.getByLabelText("Notes")).toHaveValue("Review pricing")
  await user.click(duplicate.getByRole("button", { name: "Add event" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  expect(saveCalendarEvent).toHaveBeenCalledWith(null, {
    title: "Renewal call",
    color: "violet",
    notes: "Review pricing",
    starts_at: formatISO(setHours(day, 14)),
    ends_at: formatISO(setHours(day, 15)),
  })
  await user.click(screen.getByRole("button", { name: "Month" }))
  await user.click(screen.getByRole("button", { name: "New event" }))
  const dialog = within(screen.getByRole("dialog"))
  await user.type(dialog.getByLabelText("Title"), "Prep")
  await user.click(dialog.getByRole("radio", { name: "Amber" }))
  await user.click(dialog.getByLabelText("Start date"))
  expect(dialog.getByRole("grid")).toBeInTheDocument()
  await user.keyboard("{Escape}")
  await user.click(dialog.getByRole("combobox", { name: "Start minute" }))
  await user.click(dialog.getByRole("option", { name: "15" }))
  await user.click(dialog.getByRole("button", { name: "Add event" }))

  await waitFor(() =>
    expect(saveCalendarEvent).toHaveBeenCalledWith(null, {
      title: "Prep",
      color: "amber",
      notes: null,
      starts_at: formatISO(setMinutes(setHours(day, 9), 15)),
      ends_at: formatISO(setHours(day, 10)),
    }),
  )
})

it("keeps past days readable while disabling new events", () => {
  renderWithUser(<Schedule today="2026-11-21" month="2000-01" events={[]} />)
  expect(screen.getByRole("button", { name: "New event" })).toBeDisabled()
  expect(screen.getByRole("button", { name: "Saturday, January 1, 2000" })).toBeEnabled()
})

it("offers only future times today and moves the end forward when the start changes", async () => {
  vi.useFakeTimers({ toFake: ["Date"] })
  vi.setSystemTime(new Date(2026, 10, 21, 14, 30))
  try {
    const { user } = renderWithUser(<Schedule today="2026-11-21" month="2026-11" events={[]} />)
    await user.click(screen.getByRole("button", { name: "New event" }))
    const dialog = within(screen.getByRole("dialog"))
    const startHour = dialog.getByRole("combobox", { name: "Start hour" })
    const startMinute = dialog.getByRole("combobox", { name: "Start minute" })
    expect(startHour).toHaveValue("14")
    expect(startMinute).toHaveValue("31")
    await user.click(startMinute)
    expect(dialog.queryByRole("option", { name: "30" })).not.toBeInTheDocument()
    await user.click(dialog.getByRole("option", { name: "31" }))
    await user.click(startHour)
    expect(dialog.queryByRole("option", { name: "13" })).not.toBeInTheDocument()
    await user.click(dialog.getByRole("option", { name: "16" }))
    const endHour = dialog.getByRole("combobox", { name: "End hour" })
    expect(endHour).toHaveValue("17")
    await user.click(endHour)
    expect(dialog.queryByRole("option", { name: "15" })).not.toBeInTheDocument()
    await user.click(dialog.getByRole("option", { name: "16" }))
    const endMinute = dialog.getByRole("combobox", { name: "End minute" })
    expect(endMinute).toHaveValue("32")
    await user.click(endMinute)
    expect(dialog.queryByRole("option", { name: "31" })).not.toBeInTheDocument()
  } finally {
    vi.useRealTimers()
  }
})

it("uses the saved event color on each day of a multi-day event", () => {
  renderWithUser(
    <Schedule
      today="2026-11-21"
      month="2026-11"
      events={[
        {
          id: "offsite",
          title: "Offsite",
          color: "violet",
          notes: null,
          starts_at: formatISO(new Date(2026, 10, 21, 9)),
          ends_at: formatISO(new Date(2026, 10, 22, 17)),
        },
      ]}
    />,
  )
  for (const date of ["Saturday, November 21, 2026", "Sunday, November 22, 2026"]) {
    const button = screen.getByRole("button", { name: `${date}, 1 event` })
    expect(within(button).getByTitle("Offsite")).toHaveClass("bg-violet-100")
  }
})

it("shows linked task deadlines and filters them out independently", async () => {
  const { user } = renderWithUser(
    <Schedule
      today="2026-11-21"
      month="2026-11"
      initialSelection="2026-11-21"
      events={[]}
      deadlines={[{ id: "task", title: "Confirm terms", day: "2026-11-21", kind: "task" }]}
    />,
  )
  const daySchedule = within(screen.getByRole("region", { name: "Selected day schedule" }))
  expect(daySchedule.getByRole("link", { name: /Confirm terms/ })).toHaveAttribute(
    "href",
    "/tasks?search=Confirm%20terms",
  )
  await user.click(screen.getByRole("button", { name: "Filters" }))
  await user.click(screen.getByRole("checkbox", { name: "Task due dates" }))
  expect(daySchedule.queryByRole("link", { name: /Confirm terms/ })).not.toBeInTheDocument()
})

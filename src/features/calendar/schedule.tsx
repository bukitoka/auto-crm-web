"use client"

import {
  addDays,
  addHours,
  addMilliseconds,
  addMinutes,
  addMonths,
  eachDayOfInterval,
  format,
  formatISO,
  parseISO,
  startOfDay,
  startOfMinute,
} from "date-fns"
import { CalendarDays, ChevronLeft, ChevronRight, Copy, List, Pencil, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  createContext,
  type FormEvent,
  useContext,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react"
import { DayButton, type DayButtonProps, DayPicker } from "react-day-picker"
import { toast } from "sonner"
import { ComboboxSelect } from "@/components/shared/combobox-select"
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button"
import { DatePicker } from "@/components/shared/date-picker"
import { FormDialog } from "@/components/shared/form-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { readRecordLinks } from "@/features/workspace/record-input"
import {
  documentsHref,
  type RecordOptions,
  recordLabels,
  recordLink,
} from "@/features/workspace/record-links"
import { RecordPicker } from "@/features/workspace/record-picker"
import { toastResult } from "@/lib/toast-result"
import { cn } from "@/lib/utils"
import { deleteCalendarEvent, saveCalendarEvent } from "./actions"
import type { CalendarDeadline, CalendarEvent, EventColor } from "./types"

const eventColors = {
  teal: {
    label: "Teal",
    dot: "bg-teal-600 dark:bg-teal-400",
    chip: "bg-teal-100 text-teal-950 dark:bg-teal-950 dark:text-teal-100",
  },
  blue: {
    label: "Blue",
    dot: "bg-sky-600 dark:bg-sky-400",
    chip: "bg-sky-100 text-sky-950 dark:bg-sky-950 dark:text-sky-100",
  },
  amber: {
    label: "Amber",
    dot: "bg-amber-600 dark:bg-amber-400",
    chip: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
  },
  violet: {
    label: "Violet",
    dot: "bg-violet-600 dark:bg-violet-400",
    chip: "bg-violet-100 text-violet-950 dark:bg-violet-950 dark:text-violet-100",
  },
  rose: {
    label: "Rose",
    dot: "bg-rose-600 dark:bg-rose-400",
    chip: "bg-rose-100 text-rose-950 dark:bg-rose-950 dark:text-rose-100",
  },
} satisfies Record<EventColor, { label: string; dot: string; chip: string }>

const viewButton =
  "h-full aria-pressed:bg-sidebar-primary aria-pressed:text-sidebar-primary-foreground aria-pressed:hover:bg-sidebar-primary aria-pressed:hover:text-sidebar-primary-foreground"

function timeOptions(length: number) {
  return Array.from({ length }, (_, index) => {
    const value = String(index).padStart(2, "0")
    return { value, label: value }
  })
}

const hours = timeOptions(24)
const minutes = timeOptions(60)

const localDateTime = "yyyy-MM-dd'T'HH:mm"

function nextMinute(date: Date) {
  return addMinutes(startOfMinute(date), 1)
}

function EventDateTime({
  id,
  label,
  value,
  onChange,
  minimum,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  minimum: string
}) {
  const [date, time] = value.split("T")
  const [hour, minute] = time.split(":")
  const [minDate] = minimum.split("T")
  const allowedHours = hours.filter(
    (option) =>
      option.value === hour || (date >= minDate && `${date}T${option.value}:59` >= minimum),
  )
  const allowedMinutes = minutes.filter(
    (option) => option.value === minute || `${date}T${hour}:${option.value}` >= minimum,
  )

  function chooseDate(next: string) {
    const candidate = `${next}T${time}`
    onChange(candidate < minimum ? minimum : candidate)
  }

  function chooseHour(next: string) {
    if (!next) return
    const candidate = `${date}T${next}:${minute}`
    onChange(candidate < minimum ? minimum : candidate)
  }

  return (
    <Field>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_6rem]">
        <div className="space-y-1.5">
          <FieldLabel htmlFor={`${id}-date`}>{label} date</FieldLabel>
          <DatePicker
            id={`${id}-date`}
            value={date}
            onChange={chooseDate}
            minDate={parseISO(minDate)}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-subgrid">
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${id}-hour`}>Hour</FieldLabel>
            <ComboboxSelect
              id={`${id}-hour`}
              aria-label={`${label} hour`}
              value={hour}
              onChange={chooseHour}
              options={allowedHours}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor={`${id}-minute`}>Minute</FieldLabel>
            <ComboboxSelect
              id={`${id}-minute`}
              aria-label={`${label} minute`}
              value={minute}
              onChange={(next) => {
                if (next) onChange(`${date}T${hour}:${next}`)
              }}
              options={allowedMinutes}
            />
          </div>
        </div>
      </div>
    </Field>
  )
}

function EventEditor({
  day,
  event,
  duplicate = false,
  today,
  recordOptions,
}: {
  day: Date
  event?: CalendarEvent
  duplicate?: boolean
  today: string
  recordOptions?: RecordOptions
}) {
  const editing = event !== undefined && !duplicate
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const id = useId()
  const earliest = parseISO(today)
  const [range, setRange] = useState({ start: "", end: "", minimum: "" })
  const originalStart = event ? parseISO(event.starts_at) : undefined
  const originalEnd = event ? parseISO(event.ends_at) : undefined
  const defaultStart = originalStart ? format(originalStart, localDateTime) : ""
  const defaultEnd = originalEnd ? format(originalEnd, localDateTime) : ""
  const blocked = !event && day < earliest
  const minimumEnd = range.start
    ? format(
        Math.max(parseISO(range.minimum).getTime(), nextMinute(parseISO(range.start)).getTime()),
        localDateTime,
      )
    : ""

  useEffect(() => {
    if (!open) return

    const timer = window.setInterval(() => {
      const minimum = format(nextMinute(new Date()), localDateTime)
      setRange((current) => (current.minimum === minimum ? current : { ...current, minimum }))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [open])

  function handleOpenChange(next: boolean) {
    if (next) {
      const minimum = nextMinute(new Date())
      const morning = addHours(startOfDay(day), 9)
      const preferred = originalStart ?? morning
      const starts = editing || preferred >= minimum ? preferred : minimum
      const ends =
        originalStart && originalEnd
          ? addMilliseconds(starts, originalEnd.getTime() - originalStart.getTime())
          : addHours(starts, 1)
      setRange({
        start: format(starts, localDateTime),
        end: format(ends, localDateTime),
        minimum: format(minimum, localDateTime),
      })
    }
    setOpen(next)
  }

  function changeStart(start: string) {
    setRange((current) => ({
      ...current,
      start,
      end: current.end <= start ? format(addHours(parseISO(start), 1), localDateTime) : current.end,
    }))
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fields = new FormData(e.currentTarget)
    const title = String(fields.get("title")).trim()
    const { start: startValue, end: endValue } = range
    const unchangedStart = editing && startValue === defaultStart
    const start = unchangedStart ? parseISO(event.starts_at) : parseISO(startValue)
    const end = editing && endValue === defaultEnd ? parseISO(event.ends_at) : parseISO(endValue)
    if (!title) {
      toast.error("Enter an event title.")
      return
    }
    const now = new Date()
    const unchangedEnd = editing && endValue === defaultEnd
    if (!unchangedStart && start <= now) {
      toast.error("Start time must be in the future.")
      return
    }
    if (!unchangedEnd && end <= now) {
      toast.error("End time must be in the future.")
      return
    }
    if (!(end > start)) {
      toast.error("End time must be after start time.")
      return
    }
    startTransition(async () => {
      const result = await saveCalendarEvent(editing ? event.id : null, {
        title,
        ...(recordOptions ? readRecordLinks(fields) : {}),
        color: fields.get("color") as EventColor,
        notes: String(fields.get("notes")).trim() || null,
        starts_at: unchangedStart ? event.starts_at : formatISO(start),
        ends_at: editing && endValue === defaultEnd ? event.ends_at : formatISO(end),
      })
      if (toastResult(result, editing ? "Event updated" : "Event added")) setOpen(false)
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={duplicate ? "Duplicate event" : editing ? "Edit event" : "New event"}
      description="Times are shown in your local time zone."
      formId={id}
      isPending={pending}
      submitLabel={editing ? "Save changes" : "Add event"}
      trigger={
        event ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`${duplicate ? "Duplicate" : "Edit"} ${event.title}`}
            title={duplicate ? "Duplicate event" : "Edit event"}
          >
            {duplicate ? <Copy /> : <Pencil />}
          </Button>
        ) : (
          <Button disabled={blocked} title={blocked ? "Choose today or a future day" : undefined}>
            <Plus /> New event
          </Button>
        )
      }
    >
      <form id={id} onSubmit={submit}>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor={`${id}-title`}>Title</FieldLabel>
            <Input
              id={`${id}-title`}
              name="title"
              defaultValue={event?.title}
              maxLength={200}
              required
            />
          </Field>
          {range.start && (
            <>
              <EventDateTime
                id={`${id}-start`}
                label="Start"
                value={range.start}
                onChange={changeStart}
                minimum={range.minimum}
              />
              <EventDateTime
                id={`${id}-end`}
                label="End"
                value={range.end}
                onChange={(end) => setRange((current) => ({ ...current, end }))}
                minimum={minimumEnd}
              />
            </>
          )}
          {recordOptions ? <RecordPicker initial={event} options={recordOptions} /> : null}
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Event color</legend>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventColors).map(([value, tone]) => (
                <label key={value} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={value}
                    defaultChecked={value === (event?.color ?? "teal")}
                    className="peer sr-only"
                  />
                  <span
                    className="flex size-10 items-center justify-center rounded-full border border-input peer-checked:border-primary peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                    title={tone.label}
                  >
                    <span aria-hidden className={cn("size-4 rounded-full", tone.dot)} />
                    <span className="sr-only">{tone.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Field>
            <FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
            <Textarea
              id={`${id}-notes`}
              name="notes"
              defaultValue={event?.notes ?? ""}
              maxLength={4000}
            />
          </Field>
        </FieldGroup>
      </form>
    </FormDialog>
  )
}

const subscribe = () => () => {}

function occursOn(event: CalendarEvent, date: Date) {
  return parseISO(event.starts_at) < addDays(date, 1) && parseISO(event.ends_at) > date
}

const DayEvents = createContext<Map<string, CalendarEvent[]>>(new Map())
const DayDeadlines = createContext<Map<string, CalendarDeadline[]>>(new Map())

function MonthDay({ day, modifiers, className, ...props }: DayButtonProps) {
  const events = useContext(DayEvents).get(day.isoDate) ?? []
  const deadlines = useContext(DayDeadlines).get(day.isoDate) ?? []
  const total = events.length + deadlines.length
  return (
    <DayButton
      {...props}
      day={day}
      modifiers={modifiers}
      className={cn(
        "relative flex h-full w-full min-w-0 flex-col items-center gap-1 overflow-hidden p-1 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset @min-[38rem]/calendar:items-start @min-[38rem]/calendar:px-2 @min-[58rem]/calendar:gap-0.5",
        modifiers.selected && "bg-accent hover:bg-accent",
        modifiers.past && "bg-muted/50 text-muted-foreground",
        modifiers.past && modifiers.selected && "ring-1 ring-primary/50 ring-inset",
        modifiers.outside && "text-muted-foreground",
        className,
      )}
    >
      <span className="flex w-full items-center justify-center gap-1 @min-[38rem]/calendar:justify-between">
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-medium tabular-nums @min-[58rem]/calendar:size-5",
            modifiers.today && "bg-primary font-semibold text-primary-foreground",
          )}
        >
          {day.date.getDate()}
        </span>
        {total > 1 && (
          <span
            aria-hidden
            className="hidden shrink-0 text-xs tabular-nums text-muted-foreground @min-[38rem]/calendar:block"
          >
            +{total - 1}
          </span>
        )}
      </span>
      {events.length > 0 && (
        <span aria-hidden className="flex gap-0.5 @min-[38rem]/calendar:hidden">
          {events.slice(0, 3).map((event) => (
            <span
              key={event.id}
              className={cn("size-1.5 rounded-full", eventColors[event.color ?? "teal"].dot)}
            />
          ))}
        </span>
      )}
      {!events.length && deadlines[0] ? (
        <span
          aria-hidden
          className="max-w-full truncate rounded-sm bg-secondary px-1 text-xs text-secondary-foreground"
          title={deadlines[0].title}
        >
          <span className="hidden @min-[38rem]/calendar:inline">{deadlines[0].title}</span>
          <span className="block size-1.5 rounded-full bg-info @min-[38rem]/calendar:hidden" />
        </span>
      ) : null}
      {events.slice(0, 1).map((event) => (
        <span
          aria-hidden
          key={event.id}
          title={event.title}
          className={cn(
            "hidden w-full min-w-0 truncate rounded-sm px-1.5 py-0.5 text-xs font-medium @min-[38rem]/calendar:block",
            eventColors[event.color ?? "teal"].chip,
          )}
        >
          {event.title}
        </span>
      ))}
    </DayButton>
  )
}

function EventList({
  day,
  events,
  today,
  recordOptions,
}: {
  day: Date
  events: CalendarEvent[]
  today: string
  recordOptions?: RecordOptions
}) {
  return (
    <ul className="grid gap-2 py-2">
      {events.map((event) => {
        const linked = recordLink(event)
        const linkLabel =
          linked &&
          (recordOptions?.[linked.kind].find((option) => option.value === linked.id)?.label ??
            recordLabels[linked.kind])
        const starts = parseISO(event.starts_at)
        const ends = parseISO(event.ends_at)
        const formatTime = (time: Date) =>
          format(
            time,
            format(time, "yyyy-MM-dd") === format(day, "yyyy-MM-dd") ? "HH:mm" : "MMM d, HH:mm",
          )
        return (
          <li key={event.id} className="relative min-w-0 rounded-md border bg-card">
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-3 left-2.5 w-1 rounded-full",
                eventColors[event.color ?? "teal"].dot,
              )}
            />
            <div className="space-y-1 pt-3 pr-3 pl-6">
              <span
                className={cn(
                  "inline-block rounded-sm px-1.5 py-0.5 text-xs font-medium tabular-nums",
                  eventColors[event.color ?? "teal"].chip,
                )}
              >
                {formatTime(starts)}–{formatTime(ends)}
              </span>
              <p className="font-medium wrap-break-word">{event.title}</p>
              {linked ? (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-primary">
                  <Link href={linked.href} className="wrap-anywhere hover:underline">
                    {linkLabel}
                  </Link>
                  {linked.kind === "contact" ? (
                    <Link href={`${linked.href}/call-prep`} className="hover:underline">
                      Call prep
                    </Link>
                  ) : null}
                  <Link href={documentsHref(linked.kind, linked.id)} className="hover:underline">
                    Documents
                  </Link>
                </div>
              ) : null}
              {ends <= new Date() ? (
                <Link
                  href={`/assistant?meeting=${event.id}${event.contact_id ? `&contact=${event.contact_id}` : ""}`}
                  className="inline-block text-xs font-medium text-primary hover:underline"
                >
                  Draft meeting follow-up
                </Link>
              ) : null}
              {event.notes ? (
                <p className="text-sm wrap-break-word whitespace-pre-wrap text-muted-foreground">
                  {event.notes}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-1 px-1.5 pt-1 pb-1.5">
              <EventEditor day={day} today={today} recordOptions={recordOptions} event={event} />
              <EventEditor
                day={day}
                today={today}
                recordOptions={recordOptions}
                event={event}
                duplicate
              />
              <ConfirmDeleteButton
                title={`Delete ${event.title}?`}
                action={deleteCalendarEvent.bind(null, event.id)}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function DeadlineList({ items }: { items: CalendarDeadline[] }) {
  if (!items.length) return null
  return (
    <ul className="grid gap-2 py-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={
              item.kind === "deal"
                ? `/deals/${item.id}`
                : `/tasks?search=${encodeURIComponent(item.title)}`
            }
            className="block rounded-md border px-3 py-2 hover:bg-accent"
          >
            <span className="block text-xs font-medium text-muted-foreground">
              {item.kind === "task" ? "Task due" : "Deal close date"}
            </span>
            <span className="text-sm font-medium wrap-anywhere">{item.title}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Schedule({
  month,
  today,
  events,
  deadlines = [],
  recordOptions,
  initialSelection,
}: {
  month: string
  today: string
  events: CalendarEvent[]
  deadlines?: CalendarDeadline[]
  recordOptions?: RecordOptions
  initialSelection?: string
}) {
  const router = useRouter()
  const [selected, setSelected] = useState(initialSelection)
  const [visible, setVisible] = useState({ event: true, task: true, deal: true })
  const [view, setView] = useState<"month" | "agenda">("month")
  const [navigating, startNavigation] = useTransition()
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const currentDay = mounted ? format(new Date(), "yyyy-MM-dd") : today
  const selectedDay = selected ?? currentDay
  const first = parseISO(`${month}-01`)
  const day = parseISO(selectedDay.startsWith(`${month}-`) ? selectedDay : `${month}-01`)
  const days = eachDayOfInterval({ start: first, end: addDays(addMonths(first, 1), -1) })
  const byDay = new Map(
    days.map((date) => [
      format(date, "yyyy-MM-dd"),
      mounted && visible.event ? events.filter((event) => occursOn(event, date)) : [],
    ]),
  )
  const monthEvents = events.filter(
    (event) =>
      mounted &&
      visible.event &&
      parseISO(event.starts_at) < addMonths(first, 1) &&
      parseISO(event.ends_at) > first,
  )
  const deadlinesByDay = new Map<string, CalendarDeadline[]>()
  for (const deadline of deadlines.filter((item) => visible[item.kind])) {
    const items = deadlinesByDay.get(deadline.day) ?? []
    items.push(deadline)
    deadlinesByDay.set(deadline.day, items)
  }
  const agenda = new Map<string, CalendarEvent[]>()
  for (const event of monthEvents) {
    const start = parseISO(event.starts_at)
    const key = format(Math.max(start.getTime(), first.getTime()), "yyyy-MM-dd")
    const items = agenda.get(key) ?? []
    items.push(event)
    agenda.set(key, items)
  }

  function changeMonth(date: Date) {
    const next = format(date, "yyyy-MM")
    if (next !== month) startNavigation(() => router.push(`/calendar?month=${next}`))
  }

  function goToday() {
    setSelected(currentDay)
    changeMonth(parseISO(currentDay))
  }

  const dayKey = format(day, "yyyy-MM-dd")
  const daily = byDay.get(dayKey) ?? []
  const dailyDeadlines = deadlinesByDay.get(dayKey) ?? []
  const agendaDays = [...new Set([...agenda.keys(), ...deadlinesByDay.keys()])].sort()

  return (
    <div className="@container/calendar min-w-0">
      <section
        aria-label="Personal schedule"
        aria-busy={navigating}
        className="flex min-w-0 flex-col overflow-hidden rounded-lg border bg-card @min-[58rem]/calendar:h-[clamp(31rem,calc(100dvh-12rem),46rem)]"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b p-3 sm:p-4">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous month"
              onClick={() => changeMonth(addMonths(first, -1))}
            >
              <ChevronLeft />
            </Button>
            <h2
              aria-live="polite"
              className="min-w-28 text-center font-heading text-base font-semibold tabular-nums sm:min-w-36"
            >
              {format(first, "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next month"
              onClick={() => changeMonth(addMonths(first, 1))}
            >
              <ChevronRight />
            </Button>
            <Button variant="outline" onClick={goToday}>
              Today
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <fieldset
              aria-label="Calendar view"
              className="inline-flex h-10 min-w-0 items-center rounded-full border bg-card p-0.75"
            >
              <Button
                variant="ghost"
                size="sm"
                className={viewButton}
                aria-pressed={view === "month"}
                onClick={() => setView("month")}
              >
                <CalendarDays aria-hidden /> Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={viewButton}
                aria-pressed={view === "agenda"}
                onClick={() => setView("agenda")}
              >
                <List aria-hidden /> Agenda
              </Button>
            </fieldset>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Filters</Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-52">
                {Object.entries({
                  event: "Events",
                  task: "Task due dates",
                  deal: "Deal close dates",
                }).map(([key, label]) => {
                  const kind = key as keyof typeof visible
                  return (
                    <Field key={kind} orientation="horizontal">
                      <Checkbox
                        id={`calendar-filter-${kind}`}
                        checked={visible[kind]}
                        onCheckedChange={(value) =>
                          setVisible((current) => ({ ...current, [kind]: value === true }))
                        }
                      />
                      <FieldLabel htmlFor={`calendar-filter-${kind}`}>{label}</FieldLabel>
                    </Field>
                  )
                })}
              </PopoverContent>
            </Popover>
            <EventEditor day={day} today={currentDay} recordOptions={recordOptions} />
          </div>
        </header>
        {view === "month" ? (
          <div className="grid min-w-0 @min-[58rem]/calendar:min-h-0 @min-[58rem]/calendar:flex-1 @min-[58rem]/calendar:grid-cols-[minmax(0,1fr)_minmax(16rem,27%)]">
            <DayDeadlines.Provider value={deadlinesByDay}>
              <DayEvents.Provider value={byDay}>
                <DayPicker
                  className="min-w-0 @min-[58rem]/calendar:min-h-0"
                  classNames={{
                    months: "@min-[58rem]/calendar:h-full",
                    month: "@min-[58rem]/calendar:h-full",
                    month_caption: "sr-only",
                    month_grid:
                      "grid w-full grid-rows-[2rem_minmax(0,1fr)] @min-[58rem]/calendar:h-full [&>thead]:block",
                    weekdays: "grid h-full grid-cols-7 border-b",
                    weekday:
                      "flex items-center justify-center bg-muted/35 text-xs font-medium text-muted-foreground",
                    weeks:
                      "grid min-h-0 grid-rows-[repeat(6,minmax(3rem,1fr))] @min-[38rem]/calendar:grid-rows-[repeat(6,minmax(4.5rem,1fr))] @min-[58rem]/calendar:grid-rows-[repeat(6,minmax(0,1fr))]",
                    week: "grid min-h-0 grid-cols-7 [&:not(:first-child)]:border-t",
                    day: "min-w-0 border-r last:border-r-0",
                    outside: "bg-muted/30",
                    hidden: "bg-muted/30",
                  }}
                  components={{ DayButton: MonthDay }}
                  mode="single"
                  required
                  fixedWeeks
                  hideNavigation
                  month={first}
                  selected={day}
                  today={parseISO(currentDay)}
                  modifiers={{ past: { before: parseISO(currentDay) } }}
                  onSelect={(date) => setSelected(format(date, "yyyy-MM-dd"))}
                  onMonthChange={changeMonth}
                  labels={{
                    labelDayButton: (date) => {
                      const key = format(date, "yyyy-MM-dd")
                      const count = byDay.get(key)?.length ?? 0
                      const due = deadlinesByDay.get(key)?.length ?? 0
                      return `${format(date, "EEEE, MMMM d, yyyy")}${count ? `, ${count} ${count === 1 ? "event" : "events"}` : ""}${due ? `, ${due} ${due === 1 ? "deadline" : "deadlines"}` : ""}`
                    },
                  }}
                />
              </DayEvents.Provider>
            </DayDeadlines.Provider>
            <section
              aria-label="Selected day schedule"
              className="flex min-w-0 flex-col border-t @min-[58rem]/calendar:min-h-0 @min-[58rem]/calendar:border-t-0 @min-[58rem]/calendar:border-l"
            >
              <h3 aria-live="polite" className="shrink-0 px-4 pt-4 pb-2 font-heading font-semibold">
                {format(day, "EEEE, MMM d")}
              </h3>
              <ScrollArea
                className="@min-[58rem]/calendar:min-h-0 @min-[58rem]/calendar:flex-1"
                type="auto"
              >
                <div className="px-4 pb-4">
                  {mounted &&
                    (daily.length || dailyDeadlines.length ? (
                      <>
                        {daily.length ? (
                          <EventList
                            day={day}
                            events={daily}
                            today={currentDay}
                            recordOptions={recordOptions}
                          />
                        ) : null}
                        <DeadlineList items={dailyDeadlines} />
                      </>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">No events scheduled.</p>
                    ))}
                </div>
              </ScrollArea>
            </section>
          </div>
        ) : (
          <ScrollArea
            className="@min-[58rem]/calendar:min-h-0 @min-[58rem]/calendar:flex-1"
            type="auto"
          >
            <div className="divide-y">
              {mounted &&
                (agendaDays.length ? (
                  agendaDays.map((date) => {
                    const dateValue = parseISO(date)
                    return (
                      <section
                        key={date}
                        className="grid gap-x-5 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)]"
                      >
                        <h3 className="pt-3 font-heading text-sm font-semibold">
                          {format(dateValue, "EEEE, MMM d")}
                        </h3>
                        <div>
                          {agenda.has(date) ? (
                            <EventList
                              day={dateValue}
                              events={agenda.get(date) ?? []}
                              today={currentDay}
                              recordOptions={recordOptions}
                            />
                          ) : null}
                          <DeadlineList items={deadlinesByDay.get(date) ?? []} />
                        </div>
                      </section>
                    )
                  })
                ) : (
                  <p className="p-6 text-sm text-muted-foreground">No events this month.</p>
                ))}
            </div>
          </ScrollArea>
        )}
      </section>
    </div>
  )
}

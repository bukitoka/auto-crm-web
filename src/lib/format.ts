import { format, formatDistanceToNow, isPast, isToday, parseISO } from "date-fns";

export function formatCurrency(value: number | string | null | undefined, currency = "USD") {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

export function formatCompactCurrency(value: number | string, currency = "USD") {
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).formatToParts(Number(value));

  // ICU versions disagree on trailing zeros: some render 15000 as "$15.0K". Drop a
  // zero fraction (and its decimal separator) so the output is the same everywhere.
  return parts
    .filter((part, index) => {
      const next = parts[index + 1];
      if (part.type === "fraction" && Number(part.value) === 0) return false;
      if (part.type === "decimal" && next?.type === "fraction" && Number(next.value) === 0) {
        return false;
      }
      return true;
    })
    .map((part) => part.value)
    .join("");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";
  return format(parseISO(value), "MMM d, yyyy");
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Not set";
  return format(parseISO(value), "MMM d, yyyy · HH:mm");
}

export function formatRelative(value: string | null | undefined) {
  if (!value) return "Not set";
  return formatDistanceToNow(parseISO(value), { addSuffix: true });
}

/** A due date is overdue when it is in the past and not today. */
export function isOverdue(value: string | null | undefined) {
  if (!value) return false;
  const date = parseISO(value);
  return isPast(date) && !isToday(date);
}

/** `"YYYY-MM-DD"` for date inputs, from an ISO date or datetime. */
export function toDateInput(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export function personName(person: { first_name: string; last_name?: string | null }) {
  return [person.first_name, person.last_name].filter(Boolean).join(" ");
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

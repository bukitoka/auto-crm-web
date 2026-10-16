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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value));
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

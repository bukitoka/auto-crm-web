import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatRelative,
  initials,
  isOverdue,
  personName,
  toDateInput,
} from "./format";

describe("formatCurrency", () => {
  it("formats numbers and numeric strings without decimals", () => {
    expect(formatCurrency(1234.5)).toBe("$1,235");
    expect(formatCurrency("5000.00")).toBe("$5,000");
  });

  it("uses the given currency", () => {
    expect(formatCurrency(1000, "EUR")).toBe("€1,000");
  });

  it("treats null and undefined as zero", () => {
    expect(formatCurrency(null)).toBe("$0");
    expect(formatCurrency(undefined)).toBe("$0");
  });

  it("falls back to 'CODE amount' for an invalid currency code", () => {
    expect(formatCurrency(1234, "XX")).toBe("XX 1,234");
  });
});

describe("formatCompactCurrency", () => {
  it("abbreviates large amounts", () => {
    expect(formatCompactCurrency(1_250_000)).toBe("$1.3M");
    expect(formatCompactCurrency("15000")).toBe("$15K");
  });
});

describe("date formatting", () => {
  it("formats a date", () => {
    expect(formatDate("2026-03-05")).toBe("Mar 5, 2026");
  });

  it("formats a date with time", () => {
    // Without a timezone suffix it is parsed as local time, so the output is the same everywhere.
    expect(formatDateTime("2026-03-05T14:30:00")).toBe("Mar 5, 2026 · 14:30");
  });

  it("shows a dash for empty values", () => {
    expect(formatDate(null)).toBe("Not set");
    expect(formatDateTime(undefined)).toBe("Not set");
    expect(formatRelative("")).toBe("Not set");
  });

  it("converts ISO values to YYYY-MM-DD for date inputs", () => {
    expect(toDateInput("2026-03-05T14:30:00Z")).toBe("2026-03-05");
    expect(toDateInput("2026-03-05")).toBe("2026-03-05");
    expect(toDateInput(null)).toBe("");
  });
});

describe("relative dates", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-10T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats past and future dates relative to now", () => {
    expect(formatRelative("2026-03-10T09:00:00")).toBe("about 3 hours ago");
    expect(formatRelative("2026-03-13T12:00:00")).toBe("in 3 days");
  });

  it("isOverdue is true only for days before today", () => {
    expect(isOverdue("2026-03-09")).toBe(true);
    expect(isOverdue("2026-03-10")).toBe(false); // today is not overdue yet
    expect(isOverdue("2026-03-11")).toBe(false);
    expect(isOverdue(null)).toBe(false);
  });
});

describe("names", () => {
  it("joins first and last name, skipping a missing last name", () => {
    expect(personName({ first_name: "Jane", last_name: "Doe" })).toBe("Jane Doe");
    expect(personName({ first_name: "Jane", last_name: null })).toBe("Jane");
    expect(personName({ first_name: "Jane" })).toBe("Jane");
  });

  it("builds up to two uppercase initials", () => {
    expect(initials("jane doe")).toBe("JD");
    expect(initials("Jane  Mary Doe")).toBe("JM");
    expect(initials("Jane")).toBe("J");
    expect(initials("")).toBe("");
  });
});

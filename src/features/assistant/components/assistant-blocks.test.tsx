import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AssistantBlock } from "../types";
import { AssistantBlocks } from "./assistant-blocks";

// Recharts measures its container, which jsdom cannot, so the chart internals are stubbed.
vi.mock("recharts", async (importOriginal) => {
  const original = await importOriginal<typeof import("recharts")>();
  return {
    ...original,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

const blocks: AssistantBlock[] = [
  {
    type: "metrics",
    title: "This month",
    items: [
      { label: "Won value", value: "$12,400", hint: "3 deals" },
      { label: "Win rate", value: "42%", hint: null },
    ],
  },
  {
    type: "chart",
    kind: "pie",
    title: "Where do my leads come from?",
    unit: "number",
    categories: ["Web form", "Referral"],
    series: [{ name: "Leads", values: [6, 2] }],
  },
  {
    type: "chart",
    kind: "bar",
    title: "Won deal value per month",
    unit: "currency",
    categories: ["Sep", "Oct"],
    series: [{ name: "Won", values: [4000, 8400] }],
  },
  {
    type: "table",
    title: "Deals closing soon",
    columns: ["Deal", "Value"],
    rows: [
      ["Renewal", "$5,000"],
      ["Pilot", null],
    ],
    row_links: [{ entity: "deal", id: "d1" }, null],
  },
];

describe("AssistantBlocks", () => {
  it("renders metric cards with their labels, values and hints", () => {
    render(<AssistantBlocks blocks={blocks} />);

    expect(screen.getByText("This month")).toBeInTheDocument();
    expect(screen.getByText("$12,400")).toBeInTheDocument();
    expect(screen.getByText("3 deals")).toBeInTheDocument();
    expect(screen.getByText("Win rate")).toBeInTheDocument();
  });

  it("titles each chart with its question and lists pie slices with shares", () => {
    render(<AssistantBlocks blocks={blocks} />);

    expect(screen.getByText("Where do my leads come from?")).toBeInTheDocument();
    expect(screen.getByText("Won deal value per month")).toBeInTheDocument();
    expect(screen.getByText("Web form")).toBeInTheDocument();
    expect(screen.getByText("6 (75%)")).toBeInTheDocument();
  });

  it("links the first cell of a row to its record and leaves other rows plain", () => {
    render(<AssistantBlocks blocks={blocks} />);

    expect(screen.getByRole("link", { name: "Renewal" })).toHaveAttribute("href", "/deals/d1");
    expect(screen.getByText("Pilot")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Pilot" })).not.toBeInTheDocument();
  });
});

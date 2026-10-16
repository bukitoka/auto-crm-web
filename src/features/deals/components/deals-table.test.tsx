import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeDeal } from "@/test/factories";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { DealsTable } from "./deals-table";

vi.mock("../actions", () => ({ deleteDeal: vi.fn() }));

describe("DealsTable", () => {
  it("shows when each row was added in a sortable column", () => {
    setUrl("/deals?sort=created_at&order=desc");
    renderWithUser(
      <DealsTable deals={[makeDeal({ title: "Renewal", created_at: "2026-03-04T12:00:00Z" })]} />,
    );

    const header = screen.getByRole("columnheader", { name: "Added" });
    expect(header).toHaveAttribute("aria-sort", "descending");
    const row = screen.getByRole("row", { name: /Renewal/ });
    expect(within(row).getByText("Mar 4, 2026")).toHaveAttribute(
      "datetime",
      "2026-03-04T12:00:00Z",
    );
  });

  it("hides row actions for read-only viewers", () => {
    renderWithUser(<DealsTable deals={[makeDeal({ title: "Renewal" })]} readOnly />);

    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
  });
});

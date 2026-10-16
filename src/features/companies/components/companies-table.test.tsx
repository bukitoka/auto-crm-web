import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeCompany } from "@/test/factories";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { CompaniesTable } from "./companies-table";

vi.mock("../actions", () => ({ deleteCompany: vi.fn() }));

describe("CompaniesTable", () => {
  it("shows when each row was added in a sortable column", () => {
    setUrl("/companies?sort=created_at&order=desc");
    renderWithUser(
      <CompaniesTable
        companies={[makeCompany({ name: "Umbrella", created_at: "2026-03-04T12:00:00Z" })]}
      />,
    );

    const header = screen.getByRole("columnheader", { name: "Added" });
    expect(header).toHaveAttribute("aria-sort", "descending");
    const row = screen.getByRole("row", { name: /Umbrella/ });
    expect(within(row).getByText("Mar 4, 2026")).toHaveAttribute(
      "datetime",
      "2026-03-04T12:00:00Z",
    );
  });

  it("hides row actions in read-only view", () => {
    renderWithUser(<CompaniesTable companies={[makeCompany()]} readOnly />);
    expect(screen.queryByRole("button", { name: "Edit company" })).not.toBeInTheDocument();
  });
});

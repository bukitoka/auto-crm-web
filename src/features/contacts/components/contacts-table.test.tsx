import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { makeContact } from "@/test/factories";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { ContactsTable } from "./contacts-table";

vi.mock("../actions", () => ({ deleteContact: vi.fn() }));

describe("ContactsTable", () => {
  it("shows when each row was added in a sortable column", () => {
    setUrl("/contacts?sort=created_at&order=desc");
    renderWithUser(
      <ContactsTable
        contacts={[makeContact({ first_name: "Avery", created_at: "2026-03-04T12:00:00Z" })]}
        companies={[]}
      />,
    );

    const header = screen.getByRole("columnheader", { name: "Added" });
    expect(header).toHaveAttribute("aria-sort", "descending");
    const row = screen.getByRole("row", { name: /Avery/ });
    expect(within(row).getByText("Mar 4, 2026")).toHaveAttribute(
      "datetime",
      "2026-03-04T12:00:00Z",
    );
  });

  it("offers edit and delete to admins", () => {
    renderWithUser(<ContactsTable contacts={[makeContact()]} companies={[]} />);
    expect(screen.getByRole("button", { name: "Edit contact" })).toBeInTheDocument();
  });

  it("hides row actions in read-only view", () => {
    renderWithUser(<ContactsTable contacts={[makeContact()]} companies={[]} readOnly />);
    expect(screen.queryByRole("button", { name: "Edit contact" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Actions" })).not.toBeInTheDocument();
  });
});

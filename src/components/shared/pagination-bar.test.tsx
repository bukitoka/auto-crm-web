import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaginationBar } from "./pagination-bar";

describe("PaginationBar", () => {
  it("shows the range and links to the previous and next pages, keeping filters", () => {
    render(
      <PaginationBar
        pathname="/contacts"
        searchParams={{ status: "lead", page: "2" }}
        page={2}
        size={20}
        total={45}
      />,
    );

    expect(screen.getByText("21–40 of 45")).toBeInTheDocument();
    expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    // Page 1 is the default, so the link drops ?page=.
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/contacts?status=lead",
    );
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/contacts?status=lead&page=3",
    );
  });

  it("disables both buttons when everything fits on one page", () => {
    render(<PaginationBar pathname="/tasks" searchParams={{}} page={1} size={20} total={5} />);

    expect(screen.getByText("1–5 of 5")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });

  it("handles an empty list", () => {
    render(<PaginationBar pathname="/tasks" searchParams={{}} page={1} size={20} total={0} />);

    expect(screen.getByText("0–0 of 0")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
  });

  it("disables 'next' on the last page", () => {
    render(<PaginationBar pathname="/deals" searchParams={{}} page={3} size={20} total={45} />);

    expect(screen.getByText("41–45 of 45")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous page" })).toHaveAttribute(
      "href",
      "/deals?page=2",
    );
    expect(screen.queryByRole("link", { name: "Next page" })).not.toBeInTheDocument();
  });

  it("ignores repeated (array) params", () => {
    render(
      <PaginationBar
        pathname="/contacts"
        searchParams={{ tag: ["a", "b"], search: "jane" }}
        page={1}
        size={20}
        total={45}
      />,
    );

    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute(
      "href",
      "/contacts?search=jane&page=2",
    );
  });
});

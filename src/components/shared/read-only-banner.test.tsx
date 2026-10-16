import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { isCrmPath, ReadOnlyBanner } from "./read-only-banner";

describe("ReadOnlyBanner", () => {
  it("shows on CRM pages", () => {
    setUrl("/contacts/c1");
    renderWithUser(<ReadOnlyBanner />);
    expect(screen.getByText("Read-only view")).toBeInTheDocument();
  });

  it("stays hidden elsewhere", () => {
    setUrl("/team");
    renderWithUser(<ReadOnlyBanner />);
    expect(screen.queryByText("Read-only view")).not.toBeInTheDocument();
  });

  it("matches only the CRM sections", () => {
    expect(isCrmPath("/deals")).toBe(true);
    expect(isCrmPath("/deals/1")).toBe(true);
    expect(isCrmPath("/dealsx")).toBe(false);
    expect(isCrmPath("/assistant")).toBe(false);
  });
});

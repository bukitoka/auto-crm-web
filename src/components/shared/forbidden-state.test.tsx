import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithUser } from "@/test/render";
import { ForbiddenState } from "./forbidden-state";

describe("ForbiddenState", () => {
  it("explains the restriction and links home", () => {
    renderWithUser(<ForbiddenState description="Only the super admin manages admins." />);

    expect(screen.getByText("You don't have access to this page")).toBeInTheDocument();
    expect(screen.getByText("Only the super admin manages admins.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
      "href",
      "/assistant",
    );
  });
});

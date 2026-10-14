import { screen } from "@testing-library/react";
import { useTheme } from "next-themes";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { ThemeSettings } from "./theme-settings";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

describe("ThemeSettings", () => {
  it("marks the current theme and switches on click", async () => {
    const setTheme = vi.fn();
    vi.mocked(useTheme).mockReturnValue({ theme: "light", setTheme, themes: [] });
    const { user } = renderWithUser(<ThemeSettings />);

    expect(screen.getByRole("button", { name: "Light" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Dark" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Dark" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});

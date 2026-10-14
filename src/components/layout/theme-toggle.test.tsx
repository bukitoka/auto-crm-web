import { screen } from "@testing-library/react";
import { useTheme } from "next-themes";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { ThemeToggle } from "./theme-toggle";

vi.mock("next-themes", () => ({ useTheme: vi.fn() }));

function mockTheme(theme: string) {
  const setTheme = vi.fn();
  vi.mocked(useTheme).mockReturnValue({ theme, setTheme, themes: [] });
  return setTheme;
}

describe("ThemeToggle", () => {
  it("marks the current theme in the menu", async () => {
    mockTheme("dark");
    const { user } = renderWithUser(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(screen.getByRole("menuitemradio", { name: "Dark" })).toBeChecked();
    expect(screen.getByRole("menuitemradio", { name: "Light" })).not.toBeChecked();
  });

  it.each(["Light", "Dark", "System"])("switches to %s", async (label) => {
    const setTheme = mockTheme("system");
    const { user } = renderWithUser(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: label }));

    expect(setTheme).toHaveBeenCalledWith(label.toLowerCase());
  });
});

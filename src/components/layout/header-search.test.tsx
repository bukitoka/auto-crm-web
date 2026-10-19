import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { quickSearch } from "@/features/search/actions";
import { router } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { HeaderSearch } from "./header-search";

vi.mock("@/features/search/actions", () => ({ quickSearch: vi.fn() }));

const results = [
  {
    label: "Contacts",
    items: [
      {
        id: "c1",
        kind: "contact" as const,
        title: "Jane Doe",
        subtitle: "jane@acme.com",
        href: "/contacts/c1",
        image: null,
      },
    ],
  },
  {
    label: "More",
    items: [
      {
        id: "all",
        kind: "all" as const,
        title: "See all results for “jane”",
        subtitle: null,
        href: "/search?q=jane",
        image: null,
      },
    ],
  },
];

async function openDialog(user: ReturnType<typeof renderWithUser>["user"]) {
  await user.click(screen.getByRole("button", { name: "Search" }));
  return screen.getByRole("combobox");
}

describe("HeaderSearch", () => {
  it("keeps only a trigger in the header until it is opened", () => {
    renderWithUser(<HeaderSearch />);

    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows grouped live results and opens the one you pick", async () => {
    vi.mocked(quickSearch).mockResolvedValue({ ok: true, data: results });
    const { user } = renderWithUser(<HeaderSearch />);

    await user.type(await openDialog(user), "jane");

    expect(await screen.findByRole("option", { name: /Jane Doe/ })).toBeInTheDocument();
    expect(screen.getByText("Contacts")).toBeInTheDocument();
    expect(quickSearch).toHaveBeenLastCalledWith("jane");

    await user.click(screen.getByRole("option", { name: /See all results/ }));
    expect(router.push).toHaveBeenCalledWith("/search?q=jane");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not search for a single character", async () => {
    const { user } = renderWithUser(<HeaderSearch />);

    await user.type(await openDialog(user), "j");
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(quickSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/Type at least 2 characters/)).toBeInTheDocument();
  });

  it("opens with ⌘K", async () => {
    const { user } = renderWithUser(<HeaderSearch />);

    await user.keyboard("{Meta>}k{/Meta}");

    expect(await screen.findByRole("combobox")).toHaveFocus();
  });
});

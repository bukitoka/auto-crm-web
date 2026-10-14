import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router, setUrl } from "@/test/next-mocks";
import { SearchInput } from "./search-input";

// Fake timers let us step through the 350ms debounce. `shouldAdvanceTime` keeps
// user-event's own small delays working.
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

function renderSearch(url: string) {
  setUrl(url);
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(<SearchInput placeholder="Search contacts" />);
  return { user, view, input: screen.getByRole("searchbox", { name: "Search contacts" }) };
}

describe("SearchInput", () => {
  it("starts with the current ?search= value", () => {
    const { input } = renderSearch("/contacts?search=jane");

    expect(input).toHaveValue("jane");
  });

  it("updates ?search= once the user stops typing", async () => {
    const { user, input } = renderSearch("/contacts?status=lead&page=2");

    await user.type(input, "jane ");
    expect(router.replace).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(350));

    expect(router.replace).toHaveBeenCalledTimes(1);
    // trimmed, other filters kept, page reset
    expect(router.replace).toHaveBeenCalledWith("/contacts?status=lead&search=jane", {
      scroll: false,
    });
  });

  it("removes ?search= when the box is cleared", async () => {
    const { user, input } = renderSearch("/contacts?search=jane");

    await user.clear(input);
    act(() => vi.advanceTimersByTime(350));

    expect(router.replace).toHaveBeenCalledWith("/contacts", { scroll: false });
  });

  it("follows the URL when it changes elsewhere (e.g. a nav link) instead of restoring the old search", () => {
    const { view, input } = renderSearch("/contacts?search=jane");

    setUrl("/contacts");
    view.rerender(<SearchInput placeholder="Search contacts" />);
    act(() => vi.advanceTimersByTime(350));

    expect(input).toHaveValue("");
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("keeps typing that happens while its own URL update is still loading", async () => {
    const { user, view, input } = renderSearch("/contacts");

    await user.type(input, "jan");
    act(() => vi.advanceTimersByTime(350));
    await user.type(input, "e");
    // The URL update for "jan" lands after the user typed "e".
    setUrl("/contacts?search=jan");
    view.rerender(<SearchInput placeholder="Search contacts" />);

    expect(input).toHaveValue("jane");
    act(() => vi.advanceTimersByTime(350));
    expect(router.replace).toHaveBeenLastCalledWith("/contacts?search=jane", { scroll: false });
  });
});

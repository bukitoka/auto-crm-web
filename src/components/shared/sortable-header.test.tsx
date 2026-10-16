import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { router, setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { SortableHeader } from "./sortable-header";

function renderHeader(url: string) {
  setUrl(url);
  return renderWithUser(
    <table>
      <thead>
        <tr>
          <SortableHeader field="name">Name</SortableHeader>
        </tr>
      </thead>
    </table>,
  );
}

function renderDateHeader(url: string) {
  setUrl(url);
  return renderWithUser(
    <table>
      <thead>
        <tr>
          <SortableHeader field="created_at" firstOrder="desc">
            Added
          </SortableHeader>
        </tr>
      </thead>
    </table>,
  );
}

describe("SortableHeader", () => {
  it("sorts ascending first and resets the page", async () => {
    const { user } = renderHeader("/contacts?page=3&status=lead");

    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?status=lead&sort=name&order=asc", {
      scroll: false,
    });
  });

  it("switches from ascending to descending", async () => {
    const { user } = renderHeader("/contacts?sort=name&order=asc");

    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "ascending");
    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?sort=name&order=desc", {
      scroll: false,
    });
  });

  it("turns sorting off after descending", async () => {
    const { user } = renderHeader("/contacts?sort=name&order=desc");

    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts", { scroll: false });
  });

  it("starts ascending when another column is sorted", async () => {
    const { user } = renderHeader("/contacts?sort=email&order=desc");

    expect(screen.getByRole("columnheader")).not.toHaveAttribute("aria-sort");
    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?sort=name&order=asc", {
      scroll: false,
    });
  });

  it("sorts a date column newest first, then oldest first, then off", async () => {
    const first = renderDateHeader("/contacts?sort=name&order=asc");
    await first.user.click(screen.getByRole("button", { name: "Added" }));
    expect(router.replace).toHaveBeenLastCalledWith("/contacts?sort=created_at&order=desc", {
      scroll: false,
    });
    first.unmount();

    const second = renderDateHeader("/contacts?sort=created_at&order=desc");
    expect(screen.getByRole("columnheader")).toHaveAttribute("aria-sort", "descending");
    await second.user.click(screen.getByRole("button", { name: "Added" }));
    expect(router.replace).toHaveBeenLastCalledWith("/contacts?sort=created_at&order=asc", {
      scroll: false,
    });
    second.unmount();

    const third = renderDateHeader("/contacts?sort=created_at&order=asc");
    await third.user.click(screen.getByRole("button", { name: "Added" }));
    expect(router.replace).toHaveBeenLastCalledWith("/contacts", { scroll: false });
  });
});

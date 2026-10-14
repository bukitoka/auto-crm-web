import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { router, setUrl } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { ParamSelect } from "./param-select";

const options = [
  { value: "lead", label: "Lead" },
  { value: "customer", label: "Customer" },
];

function renderStatusSelect(url: string) {
  setUrl(url);
  return renderWithUser(<ParamSelect param="status" allLabel="All statuses" options={options} />);
}

describe("ParamSelect", () => {
  it("shows the 'all' label as placeholder when the param is not set", () => {
    renderStatusSelect("/contacts");

    const input = screen.getByRole("combobox", { name: "All statuses" });
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("placeholder", "All statuses");
    expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
  });

  it("shows the current value from the URL", () => {
    renderStatusSelect("/contacts?status=customer");

    expect(screen.getByRole("combobox")).toHaveValue("Customer");
  });

  it("sets the param and resets the page", async () => {
    const { user } = renderStatusSelect("/contacts?page=4&search=jane");

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Lead" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts?search=jane&status=lead", {
      scroll: false,
    });
  });

  it("filters options as you type", async () => {
    const { user } = renderStatusSelect("/contacts");

    await user.type(screen.getByRole("combobox"), "cus");

    expect(screen.getByRole("option", { name: "Customer" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Lead" })).not.toBeInTheDocument();
  });

  it("removes the param when cleared", async () => {
    const { user } = renderStatusSelect("/contacts?status=lead");

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(router.replace).toHaveBeenCalledWith("/contacts", { scroll: false });
  });
});

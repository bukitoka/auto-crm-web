import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { router } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { ConfirmDeleteButton } from "./confirm-delete-button";

describe("ConfirmDeleteButton", () => {
  it("asks for confirmation before deleting", async () => {
    const action = vi.fn();
    const { user } = renderWithUser(<ConfirmDeleteButton action={action} title="Delete contact" />);

    await user.click(screen.getByRole("button", { name: "Delete contact" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(action).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("deletes, toasts and redirects", async () => {
    const action = vi.fn().mockResolvedValue({ ok: true, data: undefined });
    const { user } = renderWithUser(
      <ConfirmDeleteButton action={action} title="Delete contact" redirectTo="/contacts" />,
    );

    await user.click(screen.getByRole("button", { name: "Delete contact" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/contacts"));
    expect(action).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Deleted");
  });

  it("keeps the dialog open when deleting fails", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, error: "Has deals", status: 409 });
    const { user } = renderWithUser(
      <ConfirmDeleteButton action={action} title="Delete contact" redirectTo="/contacts" />,
    );

    await user.click(screen.getByRole("button", { name: "Delete contact" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Has deals"));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});

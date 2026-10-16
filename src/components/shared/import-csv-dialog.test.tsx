import { screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { ImportCsvDialog } from "./import-csv-dialog";

function renderDialog(action = vi.fn()) {
  const view = renderWithUser(
    <ImportCsvDialog entity="contacts" columns={["first_name", "email"]} action={action} />,
  );
  return { ...view, action };
}

describe("ImportCsvDialog", () => {
  it("lists the columns and offers a template", async () => {
    const { user } = renderDialog();

    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(screen.getByText(/first_name \(required\), email/)).toBeInTheDocument();
    const template = screen.getByRole("link", { name: "Download template" });
    expect(template).toHaveAttribute("download", "contacts-template.csv");
    expect(template).toHaveAttribute("href", "data:text/csv;charset=utf-8,first_name%2Cemail%0A");
  });

  it("uploads the file and shows the result summary", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: true,
      data: { created: 2, skipped: 1, errors: [{ row: 4, message: "email: invalid" }] },
    });
    const { user } = renderDialog(action);
    await user.click(screen.getByRole("button", { name: "Import" }));

    const file = new File(["first_name\nJane\n"], "contacts.csv", { type: "text/csv" });
    await user.upload(screen.getByLabelText("CSV file"), file);
    await user.click(screen.getByRole("button", { name: "Import" }));

    const formData = action.mock.calls[0][0] as FormData;
    expect(formData.get("file")).toBeInstanceOf(File);
    expect(await screen.findByText("2 created, 1 skipped")).toBeInTheDocument();
    expect(screen.getByText("Row 4: email: invalid")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Imported 2 contacts");
  });

  it("shows an error toast when the import fails", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, error: "The CSV file is empty" });
    const { user } = renderDialog(action);
    await user.click(screen.getByRole("button", { name: "Import" }));

    await user.upload(screen.getByLabelText("CSV file"), new File(["x"], "a.csv"));
    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(toast.error).toHaveBeenCalledWith("The CSV file is empty");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

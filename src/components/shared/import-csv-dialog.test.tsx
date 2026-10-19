import { screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { renderWithUser } from "@/test/render";
import { ImportCsvDialog, type ImportField } from "./import-csv-dialog";

const fields: ImportField[] = [
  { name: "first_name", required: true, format: "Text, up to 100 characters.", example: "Maya" },
  { name: "email", format: "A valid email address." },
];

function renderDialog(action = vi.fn()) {
  const view = renderWithUser(
    <ImportCsvDialog
      entity="contacts"
      fields={fields}
      rules={["A row whose email already exists is skipped."]}
      action={action}
    />,
  );
  return { ...view, action };
}

async function openDialog(user: ReturnType<typeof renderDialog>["user"]) {
  await user.click(screen.getByRole("button", { name: "Import" }));
}

async function acknowledge(user: ReturnType<typeof renderDialog>["user"]) {
  await user.click(screen.getByRole("checkbox", { name: /follows this format/ }));
}

function csv(content: string) {
  return new File([content], "contacts.csv", { type: "text/csv" });
}

describe("ImportCsvDialog", () => {
  it("explains every column, the rules and offers a template", async () => {
    const { user } = renderDialog();

    await openDialog(user);

    expect(screen.getByText("first_name")).toBeInTheDocument();
    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Text, up to 100 characters.", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("A row whose email already exists is skipped.")).toBeInTheDocument();
    const template = screen.getByRole("link", { name: "Download template" });
    expect(template).toHaveAttribute("download", "contacts-template.csv");
    expect(template).toHaveAttribute("href", "data:text/csv;charset=utf-8,first_name%2Cemail%0A");
  });

  it("keeps the file picker and Import off until the format is acknowledged", async () => {
    const { user } = renderDialog();
    await openDialog(user);

    expect(screen.getByLabelText("CSV file")).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Import" }).at(-1)).toBeDisabled();

    await acknowledge(user);
    expect(screen.getByLabelText("CSV file")).toBeEnabled();
  });

  it("blocks a file whose header row lacks a required column", async () => {
    const { user, action } = renderDialog();
    await openDialog(user);
    await acknowledge(user);

    await user.upload(screen.getByLabelText("CSV file"), csv("email\njane@acme.com\n"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "missing the required column: first_name",
    );
    expect(screen.getAllByRole("button", { name: "Import" }).at(-1)).toBeDisabled();
    expect(action).not.toHaveBeenCalled();
  });

  it("uploads the file and shows the result summary", async () => {
    const action = vi.fn().mockResolvedValue({
      ok: true,
      data: { created: 2, skipped: 1, errors: [{ row: 4, message: "email: invalid" }] },
    });
    const { user } = renderDialog(action);
    await openDialog(user);
    await acknowledge(user);

    await user.upload(
      screen.getByLabelText("CSV file"),
      csv("First Name,Email,Nickname\nJane,jane@acme.com,J\n"),
    );
    expect(
      await screen.findByText(/2 columns will be read, nickname will be ignored/),
    ).toBeInTheDocument();
    await user.click(screen.getAllByRole("button", { name: "Import" }).at(-1) as HTMLElement);

    const formData = action.mock.calls[0][0] as FormData;
    expect(formData.get("file")).toBeInstanceOf(File);
    expect(await screen.findByText("2 created, 1 skipped")).toBeInTheDocument();
    expect(screen.getByText("Row 4: email: invalid")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("Imported 2 contacts");
  });

  it("shows an error toast when the import fails", async () => {
    const action = vi.fn().mockResolvedValue({ ok: false, error: "The CSV file is empty" });
    const { user } = renderDialog(action);
    await openDialog(user);
    await acknowledge(user);

    await user.upload(screen.getByLabelText("CSV file"), csv("first_name\nJane\n"));
    await user.click(screen.getAllByRole("button", { name: "Import" }).at(-1) as HTMLElement);

    expect(toast.error).toHaveBeenCalledWith("The CSV file is empty");
    expect(screen.queryByText(/created,/)).not.toBeInTheDocument();
  });
});

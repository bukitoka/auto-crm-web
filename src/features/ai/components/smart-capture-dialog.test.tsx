import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { renderWithUser } from "@/test/render";
import { extractContact, extractContactFromFile } from "../actions";
import type { ExtractedContact } from "../types";
import { SmartCaptureDialog } from "./smart-capture-dialog";

vi.mock("../actions", () => ({ extractContact: vi.fn(), extractContactFromFile: vi.fn() }));
// The prefilled contact form imports the contacts actions.
vi.mock("@/features/contacts/actions", () => ({ createContact: vi.fn(), updateContact: vi.fn() }));

const companies = [{ id: "co1", name: "Acme Inc" }];
const signature = "Jane Doe\nHead of Operations, Acme Inc.\njane@acme.com";

async function openAndExtract(text = signature) {
  const view = renderWithUser(<SmartCaptureDialog companies={companies} users={[]} />);
  await view.user.click(screen.getByRole("button", { name: "Smart capture" }));
  await view.user.type(screen.getByLabelText("Text"), text);
  await view.user.click(screen.getByRole("button", { name: "Extract contact" }));
  return view;
}

describe("SmartCaptureDialog", () => {
  it("asks for more text before calling the AI", async () => {
    await openAndExtract("Jane");

    expect(
      await screen.findByText("Paste a bit more text (signature, card, email…)"),
    ).toBeInTheDocument();
    expect(extractContact).not.toHaveBeenCalled();
  });

  it("opens the contact form prefilled with the extracted fields", async () => {
    vi.mocked(extractContact).mockResolvedValue({
      ok: true,
      data: {
        first_name: "Jane",
        last_name: "Doe",
        email: "jane@acme.com",
        job_title: "Head of Operations",
        company_name: "acme inc", // matched case-insensitively
      },
    });

    await openAndExtract();

    expect(await screen.findByRole("dialog", { name: "New contact" })).toBeInTheDocument();
    expect(extractContact).toHaveBeenCalledWith({ text: signature });
    expect(screen.getByLabelText("First name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Last name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("jane@acme.com");
    expect(screen.getByLabelText("Job title")).toHaveValue("Head of Operations");
    expect(screen.getByLabelText("Company")).toHaveValue("Acme Inc");
    expect(screen.queryByRole("dialog", { name: "Smart capture" })).not.toBeInTheDocument();
    expect(toast.info).not.toHaveBeenCalled();
  });

  it("tells the user when the company is not in the CRM yet", async () => {
    vi.mocked(extractContact).mockResolvedValue({
      ok: true,
      data: { first_name: "Bob", company_name: "Globex" },
    });

    await openAndExtract();

    await screen.findByRole("dialog", { name: "New contact" });
    expect(toast.info).toHaveBeenCalledWith(
      'Company "Globex" isn\'t in the CRM yet',
      expect.anything(),
    );
    expect(screen.getByLabelText("Company")).toHaveValue("");
  });

  it("shows the friendly warning when AI is not configured (503)", async () => {
    vi.mocked(extractContact).mockResolvedValue({
      ok: false,
      error: "AI features are not configured yet.",
      status: 503,
    });

    await openAndExtract();

    await waitFor(() =>
      expect(toast.warning).toHaveBeenCalledWith("AI is unavailable", {
        description: "AI features are not configured yet.",
      }),
    );
    expect(screen.getByRole("dialog", { name: "Smart capture" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "New contact" })).not.toBeInTheDocument();
  });

  it("shows a pending message while the AI works", async () => {
    const extraction = deferred<ActionResult<ExtractedContact>>();
    vi.mocked(extractContact).mockReturnValue(extraction.promise);

    await openAndExtract();

    expect(await screen.findByText(/Extracting details/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Extract contact/ })).toBeDisabled();

    await act(async () => extraction.resolve({ ok: true, data: { first_name: "Jane" } }));
    expect(screen.queryByText(/Extracting details/)).not.toBeInTheDocument();
  });

  it("extracts from an uploaded file (photo, PDF, ...) instead of text", async () => {
    vi.mocked(extractContactFromFile).mockResolvedValue({
      ok: true,
      data: { first_name: "Dana", last_name: "Lee", source_text: "Dana Lee" },
    });
    const { user } = renderWithUser(<SmartCaptureDialog companies={companies} users={[]} />);
    await user.click(screen.getByRole("button", { name: "Smart capture" }));
    const card = new File(["png"], "card.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Upload a file to capture"), card);

    expect(screen.getByText("card.png")).toBeInTheDocument();
    expect(screen.queryByLabelText("Text")).not.toBeInTheDocument(); // the file replaces the text box
    await user.click(screen.getByRole("button", { name: "Extract contact" }));

    expect(vi.mocked(extractContactFromFile).mock.calls[0][0].get("file")).toBe(card);
    expect(extractContact).not.toHaveBeenCalled();
    expect(await screen.findByRole("dialog", { name: "New contact" })).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Dana");
  });

  it("can remove the file and go back to text", async () => {
    const { user } = renderWithUser(<SmartCaptureDialog companies={companies} users={[]} />);
    await user.click(screen.getByRole("button", { name: "Smart capture" }));
    await user.upload(
      screen.getByLabelText("Upload a file to capture"),
      new File(["x"], "notes.txt", { type: "text/plain" }),
    );

    await user.click(screen.getByRole("button", { name: "Remove file" }));

    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Text")).toBeInTheDocument();
  });

  it("refuses files over 5 MB", async () => {
    const { user } = renderWithUser(<SmartCaptureDialog companies={companies} users={[]} />);
    await user.click(screen.getByRole("button", { name: "Smart capture" }));
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pdf", {
      type: "application/pdf",
    });

    await user.upload(screen.getByLabelText("Upload a file to capture"), big);

    expect(toast.error).toHaveBeenCalledWith("Files can be at most 5 MB");
    expect(screen.queryByText("big.pdf")).not.toBeInTheDocument();
  });

  it("attaches a pasted screenshot", async () => {
    const { user } = renderWithUser(<SmartCaptureDialog companies={companies} users={[]} />);
    await user.click(screen.getByRole("button", { name: "Smart capture" }));
    const screenshot = new File(["png"], "image.png", { type: "image/png" });

    fireEvent.paste(screen.getByRole("dialog"), { clipboardData: { files: [screenshot] } });

    expect(await screen.findByText("image.png")).toBeInTheDocument();
  });
});

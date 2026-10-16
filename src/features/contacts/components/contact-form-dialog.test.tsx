import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { makeContact } from "@/test/factories";
import { router } from "@/test/next-mocks";
import { renderWithUser } from "@/test/render";
import { createContact, updateContact } from "../actions";
import { emptyContactForm } from "../schemas";
import { ContactFormDialog } from "./contact-form-dialog";

vi.mock("../actions", () => ({ createContact: vi.fn(), updateContact: vi.fn() }));

const companies = [{ id: "co1", name: "Acme Inc" }];

function renderDialog(props: { contact?: ReturnType<typeof makeContact> } = {}) {
  const view = renderWithUser(
    <ContactFormDialog {...props} companies={companies} trigger={<Button>Open form</Button>} />,
  );
  return view;
}

describe("ContactFormDialog (create)", () => {
  it("shows validation messages and does not submit", async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Open form" }));

    // "jane@acme" passes the browser's own type="email" check but not zod's.
    await user.type(screen.getByLabelText("Email"), "jane@acme");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    expect(await screen.findByText("First name is required")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(createContact).not.toHaveBeenCalled();
  });

  it("creates the contact, toasts, closes and opens the new contact", async () => {
    vi.mocked(createContact).mockResolvedValue({ ok: true, data: makeContact({ id: "c42" }) });
    const { user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Open form" }));
    expect(screen.getByRole("dialog", { name: "New contact" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("First name"), "Jane");
    await user.type(screen.getByLabelText("Email"), "jane@acme.com");
    await user.type(screen.getByLabelText("Tags"), "vip, newsletter");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/contacts/c42"));
    expect(createContact).toHaveBeenCalledWith({
      ...emptyContactForm,
      first_name: "Jane",
      email: "jane@acme.com",
      tags: "vip, newsletter",
    });
    expect(toast.success).toHaveBeenCalledWith("Contact created");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the dialog open and shows the API error", async () => {
    vi.mocked(createContact).mockResolvedValue({
      ok: false,
      error: "Email already exists",
      status: 409,
    });
    const { user } = renderDialog();
    await user.click(screen.getByRole("button", { name: "Open form" }));

    await user.type(screen.getByLabelText("First name"), "Jane");
    await user.click(screen.getByRole("button", { name: "Create contact" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Email already exists"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe("ContactFormDialog (edit)", () => {
  it("prefills the form and saves changes without navigating", async () => {
    const contact = makeContact({ id: "c1", first_name: "Jane", tags: ["vip"] });
    vi.mocked(updateContact).mockResolvedValue({ ok: true, data: contact });
    const { user } = renderDialog({ contact });
    await user.click(screen.getByRole("button", { name: "Open form" }));

    expect(screen.getByRole("dialog", { name: "Edit contact" })).toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Jane");
    expect(screen.getByLabelText("Tags")).toHaveValue("vip");

    await user.clear(screen.getByLabelText("Last name"));
    await user.type(screen.getByLabelText("Last name"), "Smith");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Contact updated"));
    expect(updateContact).toHaveBeenCalledWith(
      "c1",
      expect.objectContaining({ first_name: "Jane", last_name: "Smith", tags: "vip" }),
    );
    expect(router.push).not.toHaveBeenCalled();
  });
});

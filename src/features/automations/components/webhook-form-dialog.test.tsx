import { screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";
import { makeWebhook } from "@/test/factories";
import { renderWithUser } from "@/test/render";
import { createWebhook, updateWebhook } from "../actions";
import { WebhookFormDialog } from "./webhook-form-dialog";

vi.mock("../actions", () => ({ createWebhook: vi.fn(), updateWebhook: vi.fn() }));

const events = ["contact.created", "deal.won"];

async function submitNewWebhook() {
  const view = renderWithUser(
    <WebhookFormDialog events={events} trigger={<Button>New subscription</Button>} />,
  );
  const { user } = view;
  await user.click(screen.getByRole("button", { name: "New subscription" }));
  await user.click(screen.getByRole("combobox", { name: "Event" }));
  await user.click(screen.getByRole("option", { name: "deal.won" }));
  await user.type(screen.getByLabelText("Target URL"), "http://localhost:5678/webhook/won");
  await user.click(screen.getByRole("button", { name: "Create subscription" }));
  return view;
}

describe("WebhookFormDialog", () => {
  it("creates the subscription and shows the signing secret once", async () => {
    vi.mocked(createWebhook).mockResolvedValue({
      ok: true,
      data: makeWebhook({ secret: "whsec_123" }),
    });

    const { user } = await submitNewWebhook();

    expect(await screen.findByRole("dialog", { name: "Signing secret" })).toBeInTheDocument();
    expect(screen.getByText("whsec_123")).toBeInTheDocument();
    expect(createWebhook).toHaveBeenCalledWith({
      event: "deal.won",
      target_url: "http://localhost:5678/webhook/won",
      is_active: true,
    });
    expect(toast.success).toHaveBeenCalledWith("Subscription created");

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.queryByText("whsec_123")).not.toBeInTheDocument();
  });

  it("validates the form", async () => {
    const { user } = renderWithUser(
      <WebhookFormDialog events={events} trigger={<Button>New subscription</Button>} />,
    );
    await user.click(screen.getByRole("button", { name: "New subscription" }));
    await user.click(screen.getByRole("button", { name: "Create subscription" }));

    expect(await screen.findByText("Pick an event")).toBeInTheDocument();
    expect(createWebhook).not.toHaveBeenCalled();
  });

  it("does not show a secret when editing", async () => {
    const webhook = makeWebhook({ id: "w1", secret: "whsec_old" });
    vi.mocked(updateWebhook).mockResolvedValue({ ok: true, data: webhook });
    const { user } = renderWithUser(
      <WebhookFormDialog webhook={webhook} events={events} trigger={<Button>Edit</Button>} />,
    );

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText("Target URL")).toHaveValue(webhook.target_url);
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Subscription updated"));
    expect(updateWebhook).toHaveBeenCalledWith("w1", {
      event: webhook.event,
      target_url: webhook.target_url,
      is_active: true,
    });
    expect(screen.queryByRole("dialog", { name: "Signing secret" })).not.toBeInTheDocument();
  });
});

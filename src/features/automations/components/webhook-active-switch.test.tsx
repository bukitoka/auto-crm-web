import { act, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { deferred } from "@/test/deferred";
import { makeWebhook } from "@/test/factories";
import { renderWithUser } from "@/test/render";
import { toggleWebhook } from "../actions";
import type { WebhookSubscription } from "../types";
import { WebhookActiveSwitch } from "./webhook-active-switch";

vi.mock("../actions", () => ({ toggleWebhook: vi.fn() }));

describe("WebhookActiveSwitch", () => {
  it("pauses an active subscription", async () => {
    vi.mocked(toggleWebhook).mockResolvedValue({
      ok: true,
      data: makeWebhook({ is_active: false }),
    });
    const { user } = renderWithUser(<WebhookActiveSwitch id="w1" isActive />);

    expect(screen.getByRole("switch", { name: "Active" })).toBeChecked();
    await user.click(screen.getByRole("switch", { name: "Active" }));

    expect(toggleWebhook).toHaveBeenCalledWith("w1", false);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Subscription paused"));
  });

  it("flips immediately (optimistic) while saving", async () => {
    const save = deferred<ActionResult<WebhookSubscription>>();
    vi.mocked(toggleWebhook).mockReturnValue(save.promise);
    const { user } = renderWithUser(<WebhookActiveSwitch id="w1" isActive={false} />);

    await user.click(screen.getByRole("switch", { name: "Active" }));

    expect(toggleWebhook).toHaveBeenCalledWith("w1", true);
    await waitFor(() => expect(screen.getByRole("switch", { name: "Active" })).toBeChecked());
    expect(screen.getByRole("switch", { name: "Active" })).toBeDisabled();

    await act(async () => save.resolve({ ok: true, data: makeWebhook() }));
    expect(screen.getByRole("switch", { name: "Active" })).toBeEnabled();
  });

  it("shows the error and goes back to the saved value when saving fails", async () => {
    vi.mocked(toggleWebhook).mockResolvedValue({ ok: false, error: "Admins only", status: 403 });
    const { user } = renderWithUser(<WebhookActiveSwitch id="w1" isActive />);

    await user.click(screen.getByRole("switch", { name: "Active" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Admins only"));
    await waitFor(() => expect(screen.getByRole("switch", { name: "Active" })).toBeChecked());
  });
});

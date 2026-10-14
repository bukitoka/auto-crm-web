import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { makePage, makeWebhook } from "@/test/factories";
import { listWebhookEvents, listWebhooks } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("listWebhooks", () => {
  it("returns a plain array response as is", async () => {
    const webhooks = [makeWebhook()];
    apiFetchMock.mockResolvedValue(webhooks);

    expect(await listWebhooks()).toEqual(webhooks);
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks", { query: { size: 100 } });
  });

  it("unwraps a paginated response", async () => {
    const webhooks = [makeWebhook()];
    apiFetchMock.mockResolvedValue(makePage(webhooks));

    expect(await listWebhooks()).toEqual(webhooks);
  });
});

describe("listWebhookEvents", () => {
  it("accepts a plain array", async () => {
    apiFetchMock.mockResolvedValue(["contact.created", "deal.won"]);

    expect(await listWebhookEvents()).toEqual(["contact.created", "deal.won"]);
    expect(apiFetchMock).toHaveBeenCalledWith("/webhooks/events");
  });

  it("accepts { events: [...] }", async () => {
    apiFetchMock.mockResolvedValue({ events: ["deal.won"] });

    expect(await listWebhookEvents()).toEqual(["deal.won"]);
  });
});

import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { makeCompany, makeContact, makeDeal, makePage } from "@/test/factories";
import { globalSearch } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("globalSearch", () => {
  it("searches contacts, companies and deals (10 each) and returns the items", async () => {
    const contact = makeContact();
    const company = makeCompany();
    const deal = makeDeal();
    apiFetchMock.mockImplementation(async (path) => {
      if (path === "/contacts") return makePage([contact]);
      if (path === "/companies") return makePage([company]);
      return makePage([deal]);
    });

    const results = await globalSearch("acme");

    expect(results).toEqual({ contacts: [contact], companies: [company], deals: [deal] });
    const query = { page: 1, size: 10, search: "acme" };
    expect(apiFetchMock).toHaveBeenCalledWith("/contacts", { query });
    expect(apiFetchMock).toHaveBeenCalledWith("/companies", { query });
    expect(apiFetchMock).toHaveBeenCalledWith("/deals", { query });
  });
});

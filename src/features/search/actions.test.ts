import { describe, expect, it, vi } from "vitest";
import { listCompanies } from "@/features/companies/api";
import { listContacts } from "@/features/contacts/api";
import { listDeals } from "@/features/deals/api";
import { makeCompany, makeContact, makeDeal, makePage } from "@/test/factories";
import { quickSearch } from "./actions";

vi.mock("@/features/contacts/api", () => ({ listContacts: vi.fn() }));
vi.mock("@/features/companies/api", () => ({ listCompanies: vi.fn() }));
vi.mock("@/features/deals/api", () => ({ listDeals: vi.fn() }));

describe("quickSearch", () => {
  it("returns nothing for very short queries", async () => {
    expect(await quickSearch(" a ")).toEqual({ ok: true, data: [] });
    expect(listContacts).not.toHaveBeenCalled();
  });

  it("groups a few matches per type and always offers all results", async () => {
    vi.mocked(listContacts).mockResolvedValue(makePage([makeContact()]));
    vi.mocked(listCompanies).mockResolvedValue(makePage([]));
    vi.mocked(listDeals).mockResolvedValue(makePage([makeDeal({ title: "Acme pilot" })]));

    const result = await quickSearch("acme");

    expect(listContacts).toHaveBeenCalledWith({ page: 1, size: 5, search: "acme" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.map((group) => group.label)).toEqual(["Contacts", "Deals", "More"]);
    expect(result.data[0].items[0]).toMatchObject({
      title: "Jane Doe",
      subtitle: "jane@acme.com",
      href: "/contacts/contact-1",
    });
    expect(result.data[1].items[0].subtitle).toMatch(/·/);
    expect(result.data[2].items[0].href).toBe("/search?q=acme");
  });

  it("shows companies with their industry", async () => {
    vi.mocked(listContacts).mockResolvedValue(makePage([]));
    vi.mocked(listCompanies).mockResolvedValue(makePage([makeCompany({ industry: "Retail" })]));
    vi.mocked(listDeals).mockResolvedValue(makePage([]));

    const result = await quickSearch("acme");

    expect(result.ok && result.data[0].items[0]).toMatchObject({
      kind: "company",
      subtitle: "Retail",
      href: "/companies/company-1",
    });
  });
});

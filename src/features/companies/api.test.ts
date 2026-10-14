import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { makeCompany, makePage } from "@/test/factories";
import { getCompany, listCompanies, listCompanyOptions } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("companies api", () => {
  it("listCompanies sends the filters as query params", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listCompanies({ page: 1, size: 20, search: "acme" });

    expect(apiFetchMock).toHaveBeenCalledWith("/companies", {
      query: { page: 1, size: 20, search: "acme" },
    });
  });

  it("getCompany fetches one company", async () => {
    apiFetchMock.mockResolvedValue(makeCompany());

    await getCompany("company-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/companies/company-1");
  });

  it("listCompanyOptions returns { id, name } refs", async () => {
    apiFetchMock.mockResolvedValue(makePage([makeCompany({ id: "co1", name: "Acme" })]));

    expect(await listCompanyOptions()).toEqual([{ id: "co1", name: "Acme" }]);
    expect(apiFetchMock).toHaveBeenCalledWith("/companies", {
      query: { page: 1, size: PICKER_PAGE_SIZE },
    });
  });
});

import { describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api-client";
import { PICKER_PAGE_SIZE } from "@/lib/constants";
import { makeContact, makePage } from "@/test/factories";
import { contactFiltersFromParams, getContact, listContactOptions, listContacts } from "./api";

vi.mock("@/lib/api-client", () => ({ apiFetch: vi.fn() }));

const apiFetchMock = vi.mocked(apiFetch);

describe("contactFiltersFromParams", () => {
  it("reads page, size, search and status from the URL", () => {
    expect(
      contactFiltersFromParams({ page: "2", size: "50", search: "jane", status: "lead" }),
    ).toEqual({ page: 2, size: 50, search: "jane", status: "lead" });
  });

  it("uses defaults for an empty URL", () => {
    expect(contactFiltersFromParams({})).toEqual({
      page: 1,
      size: 20,
      search: undefined,
      status: undefined,
    });
  });
});

describe("contacts api", () => {
  it("listContacts sends the filters as query params", async () => {
    apiFetchMock.mockResolvedValue(makePage([]));

    await listContacts({ page: 2, size: 20, search: "jane", status: "lead" });

    expect(apiFetchMock).toHaveBeenCalledWith("/contacts", {
      query: { page: 2, size: 20, search: "jane", status: "lead" },
    });
  });

  it("getContact fetches one contact", async () => {
    apiFetchMock.mockResolvedValue(makeContact());

    await getContact("contact-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/contacts/contact-1");
  });

  it("listContactOptions returns name refs for pickers", async () => {
    apiFetchMock.mockResolvedValue(makePage([makeContact({ id: "c1", last_name: null })]));

    expect(await listContactOptions()).toEqual([{ id: "c1", first_name: "Jane", last_name: null }]);
    expect(apiFetchMock).toHaveBeenCalledWith("/contacts", {
      query: { page: 1, size: PICKER_PAGE_SIZE },
    });
  });
});

import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeCompany } from "@/test/factories";
import {
  createCompany,
  deleteCompany,
  removeCompanyLogo,
  updateCompany,
  uploadCompanyLogo,
} from "./actions";
import { type CompanyFormValues, emptyCompanyForm } from "./schemas";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: CompanyFormValues = { ...emptyCompanyForm, name: "Acme Inc", domain: "acme.com" };

const expectedPayload = {
  name: "Acme Inc",
  domain: "acme.com",
  industry: null,
  size: null,
  website: null,
  notes: null,
};

describe("createCompany", () => {
  it("POSTs the payload and revalidates the list", async () => {
    const company = makeCompany();
    apiFetchMock.mockResolvedValue(company);

    expect(await createCompany(form)).toEqual({ ok: true, data: company });
    expect(apiFetchMock).toHaveBeenCalledWith("/companies", {
      method: "POST",
      body: expectedPayload,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/companies");
  });

  it("validates the input", async () => {
    expect(await createCompany({ ...form, name: "" })).toEqual({
      ok: false,
      error: "Name is required",
      status: 422,
    });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the API error without revalidating", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "Company exists"));

    expect(await createCompany(form)).toMatchObject({ ok: false, status: 409 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateCompany", () => {
  it("PATCHes the company and revalidates the list and detail page", async () => {
    apiFetchMock.mockResolvedValue(makeCompany());

    expect((await updateCompany("company-1", form)).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/companies/company-1", {
      method: "PATCH",
      body: expectedPayload,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/companies");
    expect(revalidatePath).toHaveBeenCalledWith("/companies/company-1");
  });

  it("validates the input", async () => {
    expect((await updateCompany("company-1", { ...form, name: " " })).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Not found"));

    expect((await updateCompany("company-1", form)).ok).toBe(false);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteCompany", () => {
  it("DELETEs the company and revalidates the list", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect(await deleteCompany("company-1")).toEqual({ ok: true, data: undefined });
    expect(apiFetchMock).toHaveBeenCalledWith("/companies/company-1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/companies");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "Company has contacts"));

    expect(await deleteCompany("company-1")).toMatchObject({ ok: false, status: 409 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("company logo", () => {
  it("uploads the logo as multipart and revalidates the company", async () => {
    apiFetchMock.mockResolvedValue(makeCompany({ logo_url: "http://minio/logo.webp" }));
    const formData = new FormData();
    formData.set("file", new File(["img"], "logo.png", { type: "image/png" }));

    const result = await uploadCompanyLogo("company-1", formData);

    expect(result.ok).toBe(true);
    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/companies/company-1/logo");
    expect(options?.body).toBeInstanceOf(FormData);
    expect(revalidatePath).toHaveBeenCalledWith("/companies/company-1");
  });

  it("rejects a missing file without calling the API", async () => {
    expect((await uploadCompanyLogo("company-1", new FormData())).ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("removes the logo", async () => {
    apiFetchMock.mockResolvedValue(makeCompany());

    await removeCompanyLogo("company-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/companies/company-1/logo", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/companies");
  });
});

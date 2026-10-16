import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { makeContact } from "@/test/factories";
import {
  createContact,
  deleteContact,
  importContacts,
  removeContactAvatar,
  updateContact,
  uploadContactAvatar,
} from "./actions";
import { type ContactFormValues, emptyContactForm } from "./schemas";

// Keep ApiError real; only replace the HTTP call.
vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

const form: ContactFormValues = {
  ...emptyContactForm,
  first_name: " Jane ",
  email: "jane@acme.com",
  tags: "vip, newsletter",
};

const expectedPayload = {
  first_name: "Jane",
  last_name: null,
  email: "jane@acme.com",
  phone: null,
  job_title: null,
  status: "lead",
  source: "manual",
  tags: ["vip", "newsletter"],
  company_id: null,
  owner_id: null,
};

describe("createContact", () => {
  it("POSTs the payload and revalidates the list", async () => {
    const contact = makeContact();
    apiFetchMock.mockResolvedValue(contact);

    const result = await createContact(form);

    expect(result).toEqual({ ok: true, data: contact });
    expect(apiFetchMock).toHaveBeenCalledWith("/contacts", {
      method: "POST",
      body: expectedPayload,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
  });

  it("returns a 422 without calling the API when the input is invalid", async () => {
    const result = await createContact({ ...form, first_name: "" });

    expect(result).toEqual({ ok: false, error: "First name is required", status: 422 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the API error and does not revalidate", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "Email already exists"));

    const result = await createContact(form);

    expect(result).toEqual({ ok: false, error: "Email already exists", status: 409 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("updateContact", () => {
  it("PATCHes the contact and revalidates the list and detail page", async () => {
    apiFetchMock.mockResolvedValue(makeContact());

    const result = await updateContact("contact-1", form);

    expect(result.ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/contacts/contact-1", {
      method: "PATCH",
      body: expectedPayload,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/contact-1");
  });

  it("validates the input", async () => {
    const result = await updateContact("contact-1", { ...form, email: "nope" });

    expect(result).toMatchObject({ ok: false, error: "Enter a valid email" });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("does not revalidate when the API fails", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(404, "Contact not found"));

    expect(await updateContact("contact-1", form)).toMatchObject({ ok: false, status: 404 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("deleteContact", () => {
  it("DELETEs the contact and revalidates the list", async () => {
    apiFetchMock.mockResolvedValue(undefined);

    expect(await deleteContact("contact-1")).toEqual({ ok: true, data: undefined });
    expect(apiFetchMock).toHaveBeenCalledWith("/contacts/contact-1", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
  });

  it("returns the API error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(403, "Not allowed"));

    expect(await deleteContact("contact-1")).toEqual({
      ok: false,
      error: "Not allowed",
      status: 403,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

function imageForm() {
  const formData = new FormData();
  formData.set("file", new File(["img"], "jane.png", { type: "image/png" }));
  return formData;
}

describe("uploadContactAvatar", () => {
  it("PUTs the image as multipart and revalidates the contact", async () => {
    apiFetchMock.mockResolvedValue(makeContact({ avatar_url: "http://minio/a.webp" }));

    const result = await uploadContactAvatar("contact-1", imageForm());

    expect(result.ok).toBe(true);
    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/contacts/contact-1/avatar");
    expect(options?.method).toBe("PUT");
    const body = options?.body;
    expect(body instanceof FormData && body.get("file")).toBeInstanceOf(File);
    expect(revalidatePath).toHaveBeenCalledWith("/contacts/contact-1");
  });

  it("rejects a missing file without calling the API", async () => {
    const result = await uploadContactAvatar("contact-1", new FormData());

    expect(result.ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

describe("removeContactAvatar", () => {
  it("DELETEs the photo and revalidates the contact", async () => {
    apiFetchMock.mockResolvedValue(makeContact());

    await removeContactAvatar("contact-1");

    expect(apiFetchMock).toHaveBeenCalledWith("/contacts/contact-1/avatar", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
  });
});

describe("importContacts", () => {
  function csvForm(content: string) {
    const formData = new FormData();
    formData.set("file", new File([content], "contacts.csv", { type: "text/csv" }));
    return formData;
  }

  it("POSTs the CSV as multipart and revalidates the list", async () => {
    apiFetchMock.mockResolvedValue({ created: 1, skipped: 0, errors: [] });

    const result = await importContacts(csvForm("first_name\nJane\n"));

    expect(result).toEqual({ ok: true, data: { created: 1, skipped: 0, errors: [] } });
    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/contacts/import");
    expect(options?.method).toBe("POST");
    expect(revalidatePath).toHaveBeenCalledWith("/contacts");
  });

  it("rejects files over 2 MB without calling the API", async () => {
    const result = await importContacts(csvForm("x".repeat(2 * 1024 * 1024 + 1)));

    expect(result).toMatchObject({ ok: false, status: 413 });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });
});

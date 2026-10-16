import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { createAdmin, removeMyAvatar, updateUser, uploadMyAvatar } from "./actions";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}));

const apiFetchMock = vi.mocked(apiFetch);

function imageForm() {
  const formData = new FormData();
  formData.set("file", new File(["img"], "me.png", { type: "image/png" }));
  return formData;
}

describe("uploadMyAvatar", () => {
  it("PUTs the file as multipart and refreshes every page", async () => {
    apiFetchMock.mockResolvedValue({ id: "user-1" });

    const result = await uploadMyAvatar(imageForm());

    expect(result.ok).toBe(true);
    const [path, options] = apiFetchMock.mock.calls[0];
    expect(path).toBe("/users/me/avatar");
    expect(options?.method).toBe("PUT");
    expect(options?.body).toBeInstanceOf(FormData);
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("does not call the API without a file", async () => {
    const result = await uploadMyAvatar(new FormData());

    expect(result.ok).toBe(false);
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the API error (e.g. not an image)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(400, "The file is not a valid image"));

    const result = await uploadMyAvatar(imageForm());

    expect(result).toEqual({ ok: false, error: "The file is not a valid image", status: 400 });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("removeMyAvatar", () => {
  it("DELETEs the avatar and refreshes every page", async () => {
    apiFetchMock.mockResolvedValue({ id: "user-1" });

    await removeMyAvatar();

    expect(apiFetchMock).toHaveBeenCalledWith("/users/me/avatar", { method: "DELETE" });
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });
});

describe("createAdmin", () => {
  const values = { full_name: "Jane Doe", email: "jane@acme.com", password: "secret123" };

  it("POSTs the new admin and refreshes the Team page", async () => {
    apiFetchMock.mockResolvedValue({ id: "user-3" });

    expect((await createAdmin(values)).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/users", { method: "POST", body: values });
    expect(revalidatePath).toHaveBeenCalledWith("/team");
  });

  it("validates before calling the API", async () => {
    const result = await createAdmin({ ...values, password: "short" });

    expect(result).toMatchObject({ ok: false, error: "At least 8 characters" });
    expect(apiFetchMock).not.toHaveBeenCalled();
  });

  it("returns the API error (e.g. email taken)", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(409, "A user with this email already exists"));

    expect(await createAdmin(values)).toEqual({
      ok: false,
      error: "A user with this email already exists",
      status: 409,
    });
  });
});

describe("updateUser", () => {
  it("PATCHes the changes and refreshes the Team page", async () => {
    apiFetchMock.mockResolvedValue({ id: "user-2" });

    expect((await updateUser("user-2", { is_active: false })).ok).toBe(true);
    expect(apiFetchMock).toHaveBeenCalledWith("/users/user-2", {
      method: "PATCH",
      body: { is_active: false },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/team");
  });

  it("returns the API's permission error", async () => {
    apiFetchMock.mockRejectedValue(new ApiError(403, "Only the super admin can do this"));

    const result = await updateUser("user-2", { is_active: false });

    expect(result).toEqual({
      ok: false,
      error: "Only the super admin can do this",
      status: 403,
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

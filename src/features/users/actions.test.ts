import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch } from "@/lib/api-client";
import { removeMyAvatar, uploadMyAvatar } from "./actions";

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

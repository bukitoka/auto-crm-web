import { act, screen } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";
import type { ActionResult } from "@/lib/action-result";
import { MAX_IMAGE_BYTES } from "@/lib/constants";
import { deferred } from "@/test/deferred";
import { renderWithUser } from "@/test/render";
import { ImageUpload } from "./image-upload";

function setup(src: string | null = null) {
  const onUpload = vi.fn<(formData: FormData) => Promise<ActionResult<unknown>>>();
  const onRemove = vi.fn<() => Promise<ActionResult<unknown>>>();
  const view = renderWithUser(
    <ImageUpload name="Jane Doe" src={src} onUpload={onUpload} onRemove={onRemove} />,
  );
  return { ...view, onUpload, onRemove };
}

describe("ImageUpload", () => {
  it("shows initials and an upload button when there is no picture", () => {
    setup();

    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload photo" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("uploads the chosen file and confirms", async () => {
    const { user, onUpload } = setup();
    const request = deferred<ActionResult<unknown>>();
    onUpload.mockReturnValue(request.promise);
    const file = new File(["png"], "jane.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Upload photo"), file);

    expect(onUpload.mock.calls[0][0].get("file")).toBe(file);
    expect(screen.getByRole("button", { name: "Upload photo" })).toBeDisabled();
    await act(async () => request.resolve({ ok: true, data: null }));
    expect(toast.success).toHaveBeenCalledWith("Photo updated");
  });

  it("refuses files over 5 MB before uploading", async () => {
    const { user, onUpload } = setup();
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "big.png", { type: "image/png" });

    await user.upload(screen.getByLabelText("Upload photo"), big);

    expect(onUpload).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith("Images can be at most 5 MB");
  });

  it("shows API errors", async () => {
    const { user, onUpload } = setup();
    onUpload.mockResolvedValue({ ok: false, error: "The file is not a valid image", status: 400 });

    await user.upload(
      screen.getByLabelText("Upload photo"),
      new File(["x"], "x.png", { type: "image/png" }),
    );

    expect(toast.error).toHaveBeenCalledWith("The file is not a valid image");
  });

  it("removes an existing picture", async () => {
    const { user, onRemove } = setup("http://minio.local/jane.webp");
    onRemove.mockResolvedValue({ ok: true, data: null });

    expect(screen.getByRole("button", { name: "Change photo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(onRemove).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Photo removed");
  });
});

import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES } from "./constants";
import { parseFileUpload, parseImageUpload } from "./uploads";

function formWith(file?: File) {
  const formData = new FormData();
  if (file) formData.set("file", file);
  return formData;
}

describe("parseImageUpload", () => {
  it("passes a single image file on in a fresh FormData", () => {
    const file = new File(["png-bytes"], "me.png", { type: "image/png" });
    const input = formWith(file);
    input.set("extra", "ignored");

    const result = parseImageUpload(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.get("file")).toBeInstanceOf(File);
    expect(result.data.get("extra")).toBeNull();
  });

  it("rejects a missing or empty file", () => {
    expect(parseImageUpload(formWith())).toEqual({
      ok: false,
      error: "Choose an image to upload",
      status: 422,
    });
    expect(parseImageUpload(formWith(new File([], "empty.png"))).ok).toBe(false);
  });

  it("rejects files over the size limit", () => {
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "big.png");

    expect(parseImageUpload(formWith(big))).toEqual({
      ok: false,
      error: "Images can be at most 5 MB",
      status: 413,
    });
  });
});

describe("parseFileUpload", () => {
  it("accepts any file under the limit", () => {
    const formData = new FormData();
    formData.set("file", new File(["%PDF"], "intro.pdf", { type: "application/pdf" }));

    expect(parseFileUpload(formData).ok).toBe(true);
  });

  it("uses the given size limit in its message", () => {
    const formData = new FormData();
    formData.set("file", new File([new Uint8Array(2 * 1024 * 1024 + 1)], "big.pdf"));

    expect(parseFileUpload(formData, 2 * 1024 * 1024)).toEqual({
      ok: false,
      error: "Files can be at most 2 MB",
      status: 413,
    });
  });
});

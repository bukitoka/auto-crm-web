import "server-only";
import { MAX_IMAGE_BYTES, MAX_UPLOAD_BYTES } from "./constants";

type UploadResult = { ok: true; data: FormData } | { ok: false; error: string; status: number };

/**
 * Check the `file` field of an upload FormData before forwarding it to the API.
 * The API validates the content itself; this only catches obviously wrong input early.
 */
export function parseFileUpload(formData: FormData, maxBytes = MAX_UPLOAD_BYTES): UploadResult {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload", status: 422 };
  }
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `Files can be at most ${limitMb} MB`, status: 413 };
  }
  const body = new FormData();
  body.set("file", file);
  return { ok: true, data: body };
}

/** Same check for pictures (contact photos, company logos, avatars). */
export function parseImageUpload(formData: FormData): UploadResult {
  const result = parseFileUpload(formData, MAX_IMAGE_BYTES);
  if (result.ok) return result;
  return {
    ...result,
    error: result.status === 413 ? "Images can be at most 5 MB" : "Choose an image to upload",
  };
}

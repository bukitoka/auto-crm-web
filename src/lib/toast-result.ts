"use client";

import { toast } from "sonner";
import type { ActionResult } from "./action-result";

/**
 * Show a toast for a Server Action result. Returns true on success.
 * A 503 means the AI provider is not configured, so it shows a warning instead of an error.
 */
export function toastResult<T>(
  result: ActionResult<T>,
  successMessage?: string,
): result is {
  ok: true;
  data: T;
} {
  if (result.ok) {
    if (successMessage) toast.success(successMessage);
    return true;
  }
  if (result.status === 503) {
    toast.warning("AI is unavailable", { description: result.error });
  } else {
    toast.error(result.error);
  }
  return false;
}

import { toast } from "sonner";
import { describe, expect, it } from "vitest";
import { toastResult } from "./toast-result";

// `sonner` is mocked in src/test/setup.ts.

describe("toastResult", () => {
  it("returns true and shows the success message", () => {
    expect(toastResult({ ok: true, data: undefined }, "Saved")).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Saved");
  });

  it("stays quiet on success without a message", () => {
    expect(toastResult({ ok: true, data: 1 })).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("returns false and shows the error", () => {
    expect(toastResult({ ok: false, error: "Email already exists", status: 409 }, "Saved")).toBe(
      false,
    );
    expect(toast.error).toHaveBeenCalledWith("Email already exists");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("shows a warning (not an error) when AI is unavailable (503)", () => {
    expect(toastResult({ ok: false, error: "AI not configured", status: 503 })).toBe(false);
    expect(toast.warning).toHaveBeenCalledWith("AI is unavailable", {
      description: "AI not configured",
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
});

import { redirect } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AI_UNAVAILABLE_MESSAGE, parseInput, runAction } from "./action-result";
import { ApiError } from "./api-client";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runAction", () => {
  it("wraps the returned value in { ok: true, data }", async () => {
    const result = await runAction(async () => ({ id: "1" }));

    expect(result).toEqual({ ok: true, data: { id: "1" } });
  });

  it("turns an ApiError into { ok: false, error, status }", async () => {
    const result = await runAction(async () => {
      throw new ApiError(409, "Email already exists");
    });

    expect(result).toEqual({ ok: false, error: "Email already exists", status: 409 });
  });

  it("replaces a 503 with the friendly 'AI not configured' message", async () => {
    const result = await runAction(async () => {
      throw new ApiError(503, "DEEPSEEK_API_KEY is not set");
    });

    expect(result).toEqual({ ok: false, error: AI_UNAVAILABLE_MESSAGE, status: 503 });
  });

  it("hides unexpected errors behind a generic message and logs them", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = new Error("boom");

    const result = await runAction(async () => {
      throw boom;
    });

    expect(result).toEqual({ ok: false, error: "Something went wrong. Please try again." });
    expect(consoleError).toHaveBeenCalledWith(boom);
  });

  it("re-throws Next.js redirects so they still navigate", async () => {
    await expect(runAction(async () => redirect("/logout"))).rejects.toThrow("NEXT_REDIRECT");
  });
});

describe("parseInput", () => {
  const schema = z.object({
    name: z.string().trim().min(1, "Name is required"),
    age: z.coerce.number(),
  });

  it("returns the parsed (transformed) data", () => {
    expect(parseInput(schema, { name: "  Jane ", age: "42" })).toEqual({
      ok: true,
      data: { name: "Jane", age: 42 },
    });
  });

  it("returns the first zod issue as a 422 error", () => {
    expect(parseInput(schema, { name: "", age: 1 })).toEqual({
      ok: false,
      error: "Name is required",
      status: 422,
    });
  });
});

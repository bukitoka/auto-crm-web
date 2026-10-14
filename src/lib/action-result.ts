import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";
import { ApiError } from "./api-client";

/**
 * Every Server Action returns this shape so client components can show a
 * toast without try/catch. `status` lets the UI special-case e.g. 503 (AI off).
 */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export const AI_UNAVAILABLE_MESSAGE =
  "AI features are not configured yet. Ask an admin to set DEEPSEEK_API_KEY on the API server.";

/** Run an API call and convert thrown errors into an `ActionResult`. */
export async function runAction<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await fn() };
  } catch (error) {
    // Let Next.js handle redirect()/notFound() thrown inside the call.
    unstable_rethrow(error);
    if (error instanceof ApiError) {
      const message = error.status === 503 ? AI_UNAVAILABLE_MESSAGE : error.message;
      return { ok: false, error: message, status: error.status };
    }
    console.error(error);
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}

/** Validate untrusted action input with a zod schema. */
export function parseInput<S extends z.ZodType>(
  schema: S,
  input: unknown,
): { ok: true; data: z.output<S> } | { ok: false; error: string; status?: number } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  return { ok: false, error: first ? first.message : "Invalid input", status: 422 };
}

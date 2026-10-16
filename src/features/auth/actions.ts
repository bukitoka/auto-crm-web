"use server";

import { redirect } from "next/navigation";
import { type ActionResult, parseInput, runAction } from "@/lib/action-result";
import { apiFetch } from "@/lib/api-client";
import { HOME_PATH } from "@/lib/constants";
import { clearSessionToken, setSessionToken } from "@/lib/session";
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
  type LoginValues,
  loginSchema,
  type ResetPasswordValues,
  resetPasswordSchema,
  type SetupValues,
  setupSchema,
} from "./schemas";
import type { TokenResponse } from "./types";

/**
 * Only allow relative in-app redirects (avoid open redirects). Browsers read
 * both "//host" and "/\host" as another site, so reject those too.
 */
function safeRedirectPath(from?: string) {
  if (from?.startsWith("/") && !from.startsWith("//") && !from.startsWith("/\\")) return from;
  return HOME_PATH;
}

async function loginWithCredentials(email: string, password: string) {
  const token = await apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  await setSessionToken(token.access_token);
}

export async function login(values: LoginValues, from?: string): Promise<ActionResult> {
  const parsed = parseInput(loginSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    loginWithCredentials(parsed.data.email, parsed.data.password),
  );
  if (!result.ok) return result;

  redirect(safeRedirectPath(from));
}

/** Create the super admin of a new workspace (the one-time setup page). */
export async function setUpWorkspace(values: SetupValues): Promise<ActionResult> {
  const parsed = parseInput(setupSchema, values);
  if (!parsed.ok) return parsed;

  const { full_name, email, password } = parsed.data;
  const result = await runAction(async () => {
    await apiFetch("/auth/setup", {
      method: "POST",
      body: { full_name, email, password },
      auth: false,
    });
    await loginWithCredentials(email, password);
  });
  if (!result.ok) return result;

  redirect(HOME_PATH);
}

/** Ask the API to email a reset link. The API answers the same for unknown emails. */
export async function requestPasswordReset(values: ForgotPasswordValues): Promise<ActionResult> {
  const parsed = parseInput(forgotPasswordSchema, values);
  if (!parsed.ok) return parsed;

  return runAction(async () => {
    await apiFetch("/auth/forgot-password", { method: "POST", body: parsed.data, auth: false });
  });
}

export async function resetPassword(
  token: string,
  values: ResetPasswordValues,
): Promise<ActionResult> {
  const parsed = parseInput(resetPasswordSchema, values);
  if (!parsed.ok) return parsed;

  const result = await runAction(() =>
    apiFetch<void>("/auth/reset-password", {
      method: "POST",
      body: { token, password: parsed.data.password },
      auth: false,
    }),
  );
  if (!result.ok) return result;

  redirect("/login?reset=1");
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}

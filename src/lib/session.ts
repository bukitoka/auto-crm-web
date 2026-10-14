import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

const ONE_DAY = 60 * 60 * 24;

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/** Only callable from Server Actions or Route Handlers. */
export async function setSessionToken(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY,
  });
}

/** Only callable from Server Actions or Route Handlers. */
export async function clearSessionToken() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

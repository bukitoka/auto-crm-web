import { NextResponse } from "next/server";
import { clearSessionToken } from "@/lib/session";

/**
 * Clears the session cookie and sends the user to /login. Used when the API
 * rejects the token (401) during a Server Component render, where cookies
 * cannot be modified directly.
 */
export async function GET(request: Request) {
  await clearSessionToken();
  return NextResponse.redirect(new URL("/login?expired=1", request.url));
}

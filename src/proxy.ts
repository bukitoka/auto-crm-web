import { type NextRequest, NextResponse } from "next/server";
import { AUTH_ROUTES, HOME_PATH, SESSION_COOKIE } from "@/lib/constants";

/**
 * Optimistic auth check (cookie presence only). The API still validates the
 * JWT on every call; an expired token is handled by `apiFetch` → `/logout`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (pathname.startsWith("/logout")) return NextResponse.next();

  if (!hasSession && !isAuthRoute) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("from", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

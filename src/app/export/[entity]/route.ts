import type { NextRequest } from "next/server";
import { API_URL } from "@/lib/api-client";
import { getSessionToken } from "@/lib/session";

const ENTITIES = new Set(["contacts", "companies", "deals", "tasks"]);

/**
 * CSV download: `/export/contacts?status=lead&sort=name` proxies
 * `GET /api/v1/contacts/export` with the session token (which never reaches the
 * browser). The query string carries the list's filters and sort.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/export/[entity]">) {
  const { entity } = await ctx.params;
  if (!ENTITIES.has(entity)) return new Response("Not found", { status: 404 });

  const token = await getSessionToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}/${entity}/export${request.nextUrl.search}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  } catch {
    return new Response("Cannot reach the API server.", { status: 502 });
  }
  if (response.status === 401) return Response.redirect(new URL("/logout", request.url));
  if (!response.ok) return new Response("Export failed.", { status: response.status });

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${entity}.csv"`,
    },
  });
}

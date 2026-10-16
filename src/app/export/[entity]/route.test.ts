import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { API_URL } from "@/lib/api-client";
import { SESSION_COOKIE } from "@/lib/constants";
import { setCookie } from "@/test/next-mocks";
import { GET } from "./route";

function download(entity: string, query = "") {
  const request = new NextRequest(`http://localhost/export/${entity}${query}`);
  return GET(request, { params: Promise.resolve({ entity }) });
}

describe("GET /export/[entity]", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("proxies the API export with the session token and the list query", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");
    const fetchMock = vi.fn().mockResolvedValue(new Response("first_name\nJane\n"));
    vi.stubGlobal("fetch", fetchMock);

    const response = await download("contacts", "?status=lead&sort=name");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_URL}/contacts/export?status=lead&sort=name`);
    expect(init.headers).toEqual({ Authorization: "Bearer jwt-123" });
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="contacts.csv"');
    expect(await response.text()).toBe("first_name\nJane\n");
  });

  it("rejects unknown entities without calling the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await download("users");

    expect(response.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends an expired session to /logout", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));

    const response = await download("tasks");

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("http://localhost/logout");
  });
});

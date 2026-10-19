import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiVersion } from "./app-version";

afterEach(() => vi.unstubAllGlobals());

function stubFetch(response: Partial<Response> | Error) {
  const fetchMock = vi.fn(async (..._args: unknown[]) => {
    if (response instanceof Error) throw response;
    return response as Response;
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("getApiVersion", () => {
  it("reads the version from the API's health endpoint, outside /api/v1", async () => {
    const fetchMock = stubFetch({
      ok: true,
      json: async () => ({ status: "ok", version: "2026.10.19.42", commit: "e4f5a6b" }),
    });

    expect(await getApiVersion()).toEqual({ version: "2026.10.19.42", commit: "e4f5a6b" });
    expect(String(fetchMock.mock.calls[0][0])).toBe("http://api.test/health");
  });

  it("is null when the API errors, is unreachable or sends no version", async () => {
    stubFetch({ ok: false });
    expect(await getApiVersion()).toBeNull();

    stubFetch(new Error("connect ECONNREFUSED"));
    expect(await getApiVersion()).toBeNull();

    stubFetch({ ok: true, json: async () => ({ status: "ok" }) });
    expect(await getApiVersion()).toBeNull();
  });
});

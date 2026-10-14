import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setCookie } from "@/test/next-mocks";
import { ApiError, apiFetch } from "./api-client";
import { SESSION_COOKIE } from "./constants";

const API_URL = "http://api.test/api/v1"; // set in vitest.config.mts

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** The URL and RequestInit of the n-th fetch call. */
function fetchCall(index = 0) {
  const [url, init] = fetchMock.mock.calls[index] ?? [];
  return { url: String(url), init: init ?? {} };
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

describe("apiFetch", () => {
  it("GETs the API URL and returns the parsed JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }));

    const data = await apiFetch<{ id: string }>("/contacts/1");

    expect(data).toEqual({ id: "1" });
    const { url, init } = fetchCall();
    expect(url).toBe(`${API_URL}/contacts/1`);
    expect(init.method).toBe("GET");
    expect(init.cache).toBe("no-store");
    expect(init.body).toBeUndefined();
    expect(init.headers).toEqual({ Accept: "application/json" });
  });

  it("forwards the session cookie as a Bearer token", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiFetch("/auth/me");

    expect(fetchCall().init.headers).toMatchObject({ Authorization: "Bearer jwt-123" });
  });

  it("sends no Authorization header without a session cookie", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiFetch("/auth/me");

    expect(fetchCall().init.headers).not.toHaveProperty("Authorization");
  });

  it("skips the token when auth is false", async () => {
    setCookie(SESSION_COOKIE, "jwt-123");
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiFetch("/auth/login", { method: "POST", body: {}, auth: false });

    expect(fetchCall().init.headers).not.toHaveProperty("Authorization");
  });

  it("serializes the body as JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }, 201));

    await apiFetch("/contacts", { method: "POST", body: { first_name: "Jane" } });

    const { init } = fetchCall();
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"first_name":"Jane"}');
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("sends FormData as-is and lets fetch set the multipart Content-Type", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "1" }));
    const formData = new FormData();
    formData.set("file", new File(["img"], "a.png"));

    await apiFetch("/users/me/avatar", { method: "PUT", body: formData });

    const { init } = fetchCall();
    expect(init.body).toBe(formData);
    expect(init.headers).not.toHaveProperty("Content-Type");
  });

  it("adds query params and drops empty values", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [] }));

    await apiFetch("/tasks", {
      query: { page: 2, search: "call", overdue: true, status: "", owner_id: undefined, x: null },
    });

    const url = new URL(fetchCall().url);
    expect(url.pathname).toBe("/api/v1/tasks");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      page: "2",
      search: "call",
      overdue: "true",
    });
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/contacts/1", { method: "DELETE" })).resolves.toBeUndefined();
  });

  it("throws ApiError with the FastAPI string detail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Contact not found" }, 404));

    const error = await apiFetch("/contacts/x").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      message: "Contact not found",
      detail: "Contact not found",
    });
  });

  it("joins FastAPI 422 validation errors into one message", async () => {
    const detail = [
      { loc: ["body", "email"], msg: "value is not a valid email address" },
      { loc: ["body", "first_name"], msg: "Field required" },
      { msg: "Something else" },
    ];
    fetchMock.mockResolvedValue(jsonResponse({ detail }, 422));

    const error = await apiFetch("/contacts", { method: "POST", body: {} }).catch(
      (e: unknown) => e,
    );

    expect(error).toMatchObject({
      status: 422,
      message:
        "email: value is not a valid email address, first_name: Field required, Something else",
      detail,
    });
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

    await expect(apiFetch("/dashboard/summary")).rejects.toMatchObject({
      status: 500,
      message: "Request failed (500)",
    });
  });

  it("falls back to a generic message for an empty detail list", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: [] }, 400));

    await expect(apiFetch("/contacts")).rejects.toMatchObject({
      message: "Request failed (400)",
    });
  });

  it("throws ApiError with status 0 when the API is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(apiFetch("/contacts")).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      message: "Cannot reach the API server. Is it running?",
    });
  });

  it("redirects to /logout on 401 for authenticated calls", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Token expired" }, 401));

    await expect(apiFetch("/auth/me")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/logout");
  });

  it("throws ApiError (no redirect) on 401 when auth is false, e.g. a wrong password", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Invalid email or password" }, 401));

    await expect(
      apiFetch("/auth/login", { method: "POST", body: {}, auth: false }),
    ).rejects.toMatchObject({ status: 401, message: "Invalid email or password" });
    expect(redirect).not.toHaveBeenCalled();
  });
});

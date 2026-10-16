import "server-only";
import { redirect } from "next/navigation";
import { getSessionToken } from "./session";

export const API_URL = process.env.API_URL ?? "http://localhost:8000/api/v1";

/** Error thrown for any non-2xx response from the FastAPI backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

type QueryValue = string | number | boolean | null | undefined;

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON-serialisable value, or `FormData` for file uploads (sent as multipart). */
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Send the session JWT (default true). Set false for login/register. */
  auth?: boolean;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

/** FastAPI errors are `{detail: string}` or, for 422, `{detail: [{msg, loc}]}`. */
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item: { msg?: string; loc?: unknown[] }) => {
        const field = item.loc?.at(-1);
        return field ? `${String(field)}: ${item.msg}` : (item.msg ?? "");
      })
      .join(", ");
  }
  return fallback;
}

/**
 * Typed fetch against the FastAPI backend. Server-only: forwards the JWT from
 * the httpOnly session cookie. Throws `ApiError` on non-2xx responses.
 * A 401 on an authenticated call means the session expired, so we send the
 * user through `/logout` (which clears the cookie) back to the login page.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  // For FormData, fetch sets the multipart Content-Type (with its boundary) itself.
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = await getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body:
        body === undefined || isFormData ? (body as FormData | undefined) : JSON.stringify(body),
      cache: "no-store",
    });
  } catch (error) {
    throw new ApiError(0, "Cannot reach the API server. Is it running?", error);
  }

  if (response.status === 401 && auth) {
    redirect("/logout");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const detail = data?.detail;
    throw new ApiError(
      response.status,
      messageFromDetail(detail, `Request failed (${response.status})`),
      detail,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

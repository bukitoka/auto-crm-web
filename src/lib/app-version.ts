import "server-only";
import { API_URL } from "./api-client";

export type VersionInfo = { version: string; commit: string };

/** This web build. Stamped by next.config.ts; "dev" outside production deploys. */
export const webVersion: VersionInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? "dev",
  commit: process.env.NEXT_PUBLIC_GIT_SHA ?? "",
};

/** The API release behind this web app, from its public /health. Null when it cannot be reached. */
export async function getApiVersion(): Promise<VersionInfo | null> {
  try {
    const response = await fetch(new URL("/health", API_URL), {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { version?: string; commit?: string };
    return data.version ? { version: data.version, commit: data.commit ?? "" } : null;
  } catch {
    return null;
  }
}

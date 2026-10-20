import { describe, expect, it, vi } from "vitest";
import { getChangelog } from "./changelog";
import { fallbackChangelogs } from "./data";

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200 });
}

describe("getChangelog", () => {
  it("groups release commits by date and drops chores, docs and merges", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const isWeb = String(input).includes("auto-crm-web");
        return jsonResponse([
          {
            commit: {
              message: isWeb
                ? "feat(ui): restyle toasts\n\nlonger body"
                : "fix(auth): stop lockouts",
              author: { date: "2026-10-20T10:00:00Z" },
            },
          },
          {
            commit: {
              message: isWeb ? "feat: add a report" : "perf: cache the changelog",
              author: { date: "2026-10-20T09:00:00Z" },
            },
          },
          {
            commit: { message: "chore: bump deps", author: { date: "2026-10-19T10:00:00Z" } },
          },
          {
            commit: { message: "docs: update readme", author: { date: "2026-10-18T10:00:00Z" } },
          },
          {
            commit: { message: "Merge pull request #1", author: { date: "2026-10-17T10:00:00Z" } },
          },
        ]);
      }),
    );

    const changelog = await getChangelog();

    expect(changelog.web).toEqual([
      { date: "2026-10-20", changes: ["UI: Restyle toasts", "Add a report"] },
    ]);
    expect(changelog.api).toEqual([
      { date: "2026-10-20", changes: ["Auth: Stop lockouts", "Cache the changelog"] },
    ]);
  });

  it("falls back to the curated notes when GitHub cannot be reached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("offline");
      }),
    );

    const changelog = await getChangelog();

    expect(changelog).toEqual(fallbackChangelogs);
  });

  it("falls back per repo when one request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        if (String(input).includes("auto-crm-api")) {
          return new Response("rate limited", { status: 403 });
        }
        return jsonResponse([
          {
            commit: {
              message: "feat: keep the toast rail close to the edge",
              author: { date: "2026-10-20T10:00:00Z" },
            },
          },
        ]);
      }),
    );

    const changelog = await getChangelog();

    expect(changelog.web[0].changes).toEqual(["Keep the toast rail close to the edge"]);
    expect(changelog.api).toEqual(fallbackChangelogs.api);
  });
});

import "server-only";
import { appInfo, type Changelog, type ChangelogEntry, fallbackChangelogs } from "./data";

type Repo = "web" | "api";

type GitHubCommit = {
  commit: {
    message: string;
    author: { date: string } | null;
  };
};

// Only user-facing work belongs in the changelog. Chores, docs, tests and CI stay out.
const RELEASE_COMMIT = /^(feat|fix|perf|refactor)(?:\(([^)]+)\))?!?:\s*(.+)$/i;
const UPPERCASE_SCOPES = new Set(["ai", "api", "csv", "ssr", "ui"]);

function formatScope(scope: string) {
  return UPPERCASE_SCOPES.has(scope)
    ? scope.toUpperCase()
    : scope.charAt(0).toUpperCase() + scope.slice(1);
}

function describe(message: string): string | null {
  const subject = message.split("\n")[0].trim();
  if (subject.startsWith("Merge ")) return null;

  const match = RELEASE_COMMIT.exec(subject);
  if (!match) return null;

  const [, , scope, text] = match;
  const sentence = text.charAt(0).toUpperCase() + text.slice(1);
  return scope ? `${formatScope(scope)}: ${sentence}` : sentence;
}

function groupByDate(commits: GitHubCommit[]): ChangelogEntry[] {
  const byDate = new Map<string, string[]>();

  for (const { commit } of commits) {
    const change = describe(commit.message);
    if (!change || !commit.author) continue;

    const date = commit.author.date.slice(0, 10);
    const changes = byDate.get(date) ?? [];
    changes.push(change);
    byDate.set(date, changes);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, changes]) => ({ date, changes }));
}

async function fetchChangelog(repo: Repo): Promise<ChangelogEntry[]> {
  const slug = new URL(appInfo.repo[repo]).pathname.replace(/^\//, "");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "auto-crm-web",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${slug}/commits?per_page=40`, {
      headers,
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return [];
    return groupByDate((await response.json()) as GitHubCommit[]);
  } catch {
    return [];
  }
}

/** Recent release notes from both repos, cached for an hour. Falls back to the static list. */
export async function getChangelog(): Promise<Changelog> {
  const [web, api] = await Promise.all([fetchChangelog("web"), fetchChangelog("api")]);

  return {
    web: web.length > 0 ? web : fallbackChangelogs.web,
    api: api.length > 0 ? api : fallbackChangelogs.api,
  };
}

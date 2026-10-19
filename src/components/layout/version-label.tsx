import type { VersionInfo } from "@/lib/app-version";

// "2026.10.19" reads as a release (v2026.10.19); "dev" stays as it is.
const label = (version: string) => (/^\d/.test(version) ? `v${version}` : version);

function Line({ name, info }: { name: string; info: VersionInfo | null }) {
  return (
    <p className="truncate">
      {name} {info ? label(info.version) : "unavailable"}
      {info?.commit ? ` (${info.commit.slice(0, 7)})` : ""}
    </p>
  );
}

/** Which release is running, for bug reports. Hidden while the sidebar is collapsed to icons. */
export function VersionLabel({ web, api }: { web: VersionInfo; api: VersionInfo | null }) {
  return (
    <div className="px-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
      <Line name="Web" info={web} />
      <Line name="API" info={api} />
    </div>
  );
}

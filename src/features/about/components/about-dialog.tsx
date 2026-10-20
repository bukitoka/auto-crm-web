"use client";

import { format, parseISO } from "date-fns";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { VersionInfo } from "@/lib/app-version";
import { appInfo, type Changelog, type ChangelogEntry } from "../data";

type AboutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versions: { web: VersionInfo; api: VersionInfo | null };
  changelog: Changelog;
};

function versionLabel(version: string) {
  return /^\d/.test(version) ? `v${version}` : version;
}

function VersionRow({ name, info }: { name: string; info: VersionInfo | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">{name}</span>
        {info ? (
          <Badge variant="secondary">{versionLabel(info.version)}</Badge>
        ) : (
          <Badge variant="outline">Unavailable</Badge>
        )}
      </div>
      <span className="truncate text-xs text-muted-foreground">
        {info ? (info.commit ? info.commit.slice(0, 7) : "No commit stamp") : "Health check failed"}
      </span>
    </div>
  );
}

function ChangelogList({ entries, repoUrl }: { entries: ChangelogEntry[]; repoUrl: string }) {
  return (
    <div className="grid gap-3">
      <ol className="grid gap-4">
        {entries.map((entry) => (
          <li key={entry.date} className="grid gap-1 sm:grid-cols-[6rem_1fr] sm:gap-3">
            <time dateTime={entry.date} className="text-xs text-muted-foreground">
              {format(parseISO(entry.date), "MMM d, yyyy")}
            </time>
            <ul className="grid gap-1">
              {entry.changes.map((change) => (
                <li key={change} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground/50"
                  />
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <Button variant="link" size="sm" className="h-auto justify-start px-0" asChild>
        <a href={`${repoUrl}/commits/main`} target="_blank" rel="noreferrer">
          View all commits
        </a>
      </Button>
    </div>
  );
}

export function AboutDialog({ open, onOpenChange, versions, changelog }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div className="grid gap-1">
              <DialogTitle>{appInfo.name}</DialogTitle>
              <DialogDescription>{appInfo.tagline}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <section aria-labelledby="about-what" className="grid gap-2">
          <h3 id="about-what" className="font-medium">
            What this is
          </h3>
          <p className="text-muted-foreground">
            Contacts, companies, deals and tasks in one workspace, with an assistant that can answer
            questions about the pipeline, log notes and calls, and draft emails. Each admin manages
            their own data, and a super admin oversees every account.
          </p>
        </section>

        <section aria-labelledby="about-versions" className="grid gap-2">
          <h3 id="about-versions" className="font-medium">
            Versions
          </h3>
          <VersionRow name="Web" info={versions.web} />
          <VersionRow name="API" info={versions.api} />
        </section>

        <section aria-labelledby="about-changelog" className="grid gap-2">
          <h3 id="about-changelog" className="font-medium">
            Changelog
          </h3>
          <Tabs defaultValue="web">
            <TabsList className="w-full">
              <TabsTrigger value="web">Web</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            <TabsContent value="web" className="pt-2">
              <ChangelogList entries={changelog.web} repoUrl={appInfo.repo.web} />
            </TabsContent>
            <TabsContent value="api" className="pt-2">
              <ChangelogList entries={changelog.api} repoUrl={appInfo.repo.api} />
            </TabsContent>
          </Tabs>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>
            Built by{" "}
            <a
              href={appInfo.developer.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {appInfo.developer.name}
            </a>
          </p>
          <div className="flex gap-3">
            <a
              href={appInfo.repo.web}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Web source
            </a>
            <a
              href={appInfo.repo.api}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              API source
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

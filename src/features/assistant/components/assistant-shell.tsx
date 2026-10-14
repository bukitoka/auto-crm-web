import type { ReactNode } from "react";

/**
 * Full-height area for the chat pages: cancels the dashboard padding so the
 * conversation can scroll on its own with the composer pinned to the bottom.
 */
export function AssistantShell({ children }: { children: ReactNode }) {
  return (
    <div className="-m-4 flex h-[calc(100svh-3.5rem)] min-h-0 min-w-0 flex-col md:-m-6">
      {children}
    </div>
  );
}

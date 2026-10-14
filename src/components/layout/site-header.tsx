import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AssistantPanel } from "@/features/assistant/components/assistant-panel";
import { AppBreadcrumbs } from "./app-breadcrumbs";
import { HeaderSearch } from "./header-search";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-vertical:h-4 data-vertical:self-center"
      />
      <AppBreadcrumbs />
      <div className="ml-auto flex items-center gap-2">
        <HeaderSearch />
        <AssistantPanel />
        <ThemeToggle />
      </div>
    </header>
  );
}

import { cookies } from "next/headers";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { ReadOnlyBanner } from "@/components/shared/read-only-banner";
import { SIDEBAR_DEFAULT_WIDTH, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getChangelog } from "@/features/about/changelog";
import { listConversations } from "@/features/assistant/api";
import { getCurrentUser } from "@/features/auth/api";
import { canWriteCrm } from "@/features/users/roles";
import { getApiVersion, webVersion } from "@/lib/app-version";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const [user, cookieStore, recentChats, apiVersion, changelog] = await Promise.all([
    getCurrentUser(),
    cookies(),
    // The sidebar's "Recent chats" are optional: never break every page over them.
    listConversations({ size: 8 })
      .then((page) => page.items)
      .catch(() => []),
    getApiVersion(),
    getChangelog(),
  ]);
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  // Width chosen by dragging the sidebar edge (saved by SidebarRail); clamped by the provider.
  const defaultWidth = Number(cookieStore.get("sidebar_width")?.value) || SIDEBAR_DEFAULT_WIDTH;

  return (
    <SidebarProvider defaultOpen={defaultOpen} defaultWidth={defaultWidth}>
      <AppSidebar
        user={user}
        recentChats={recentChats}
        versions={{ web: webVersion, api: apiVersion }}
        changelog={changelog}
      />
      {/* min-w-0 lets wide content (e.g. the deals canvas) scroll instead of stretching the page. */}
      <SidebarInset className="min-w-0">
        <SiteHeader />
        <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6">
          {canWriteCrm(user) ? null : <ReadOnlyBanner />}
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

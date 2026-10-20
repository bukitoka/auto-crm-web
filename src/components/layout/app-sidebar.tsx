"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import type { Changelog } from "@/features/about/data";
import { NavChats } from "@/features/assistant/components/nav-chats";
import type { Conversation } from "@/features/assistant/types";
import type { User } from "@/features/users/types";
import type { VersionInfo } from "@/lib/app-version";
import { HOME_PATH } from "@/lib/constants";
import { mainNav, type NavItem, secondaryNav, visibleNav } from "./nav-items";
import { NavUser } from "./nav-user";

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  user: User;
  recentChats: Conversation[];
  versions: { web: VersionInfo; api: VersionInfo | null };
  changelog: Changelog;
};

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ user, recentChats, versions, changelog, ...props }: AppSidebarProps) {
  const workspaceItems = visibleNav(secondaryNav, user);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={HOME_PATH}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Auto CRM</span>
                  <span className="truncate text-xs text-muted-foreground">CRM workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="CRM" items={mainNav} />
        <NavChats conversations={recentChats} />
        <NavGroup label="Workspace" items={workspaceItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} versions={versions} changelog={changelog} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

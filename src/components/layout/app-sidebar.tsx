"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentProps } from "react"
import { Brand } from "@/components/shared/brand"
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
} from "@/components/ui/sidebar"
import type { Changelog } from "@/features/about/data"
import { NavChats } from "@/features/assistant/components/nav-chats"
import type { Conversation } from "@/features/assistant/types"
import type { User } from "@/features/users/types"
import type { VersionInfo } from "@/lib/app-version"
import { HOME_PATH } from "@/lib/constants"
import { mainNav, type NavItem, secondaryNav, visibleNav } from "./nav-items"
import { NavUser } from "./nav-user"

type AppSidebarProps = ComponentProps<typeof Sidebar> & {
  user: User
  recentChats: Conversation[]
  versions: { web: VersionInfo; api: VersionInfo | null }
  changelog: Changelog
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname()
  return (
    <SidebarGroup className="py-3">
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              >
                <Link
                  href={item.href}
                  aria-current={
                    pathname === item.href || pathname.startsWith(`${item.href}/`)
                      ? "page"
                      : undefined
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function AppSidebar({ user, recentChats, versions, changelog, ...props }: AppSidebarProps) {
  const workspaceItems = visibleNav(secondaryNav, user)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="h-14 shrink-0 justify-center border-b border-sidebar-border px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:justify-center [&_svg]:size-9!"
            >
              <Link href={HOME_PATH} aria-label="Auto CRM home">
                <Brand />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavGroup label="CRM" items={mainNav} />
        <NavGroup label="Workspace" items={workspaceItems} />
        <NavChats conversations={recentChats} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser user={user} versions={versions} changelog={changelog} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

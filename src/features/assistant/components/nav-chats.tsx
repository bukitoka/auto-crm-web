"use client";

import { History, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Conversation } from "../types";
import { ConversationMenu } from "./conversation-menu";

/** Hidden when the sidebar is collapsed to icons. */
export function NavChats({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
      <SidebarGroupAction asChild title="New chat">
        <Link href="/assistant">
          <Plus />
          <span className="sr-only">New chat</span>
        </Link>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {conversations.length === 0 ? (
            <p className="px-3 py-1.5 text-xs text-sidebar-foreground/60">
              Your chats with the assistant show up here.
            </p>
          ) : (
            conversations.map((conversation) => (
              <SidebarMenuItem key={conversation.id}>
                <SidebarMenuButton
                  asChild
                  size="sm"
                  isActive={pathname === `/assistant/${conversation.id}`}
                  tooltip={conversation.title}
                >
                  <Link href={`/assistant/${conversation.id}`}>
                    <span className="truncate">{conversation.title}</span>
                  </Link>
                </SidebarMenuButton>
                <ConversationMenu
                  conversation={conversation}
                  side="right"
                  align="start"
                  trigger={
                    <SidebarMenuAction showOnHover aria-label={`Options for ${conversation.title}`}>
                      <MoreHorizontal />
                    </SidebarMenuAction>
                  }
                />
              </SidebarMenuItem>
            ))
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm" className="text-sidebar-foreground/70">
              <Link href="/assistant/history">
                <History />
                <span>All chats</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

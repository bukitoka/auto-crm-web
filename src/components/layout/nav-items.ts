import {
  Building2,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  Handshake,
  Inbox,
  LayoutDashboard,
  type LucideIcon,
  MessageCircle,
  MessagesSquare,
  Settings,
  UserCog,
  Users,
  Workflow,
} from "lucide-react"
import { isSuperAdmin } from "@/features/users/roles"
import type { User } from "@/features/users/types"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  superAdminOnly?: boolean
}

export const mainNav: NavItem[] = [
  { title: "Assistant", href: "/assistant", icon: MessageCircle },
  { title: "Insights", href: "/dashboard", icon: LayoutDashboard },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Follow-ups", href: "/follow-ups", icon: Inbox },
]

export const secondaryNav: NavItem[] = [
  { title: "AI chats", href: "/ai-chats", icon: MessagesSquare, superAdminOnly: true },
  { title: "Automations", href: "/automations", icon: Workflow, superAdminOnly: true },
  { title: "Admins", href: "/team", icon: UserCog, superAdminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function visibleNav(items: NavItem[], user: Pick<User, "is_super_admin">) {
  return items.filter((item) => !item.superAdminOnly || isSuperAdmin(user))
}

/** Labels used by the header breadcrumbs. */
export const segmentLabels: Record<string, string> = {
  assistant: "Assistant",
  dashboard: "Insights",
  "ai-chats": "AI chats",
  history: "History",
  contacts: "Contacts",
  companies: "Companies",
  deals: "Deals",
  tasks: "Tasks",
  calendar: "Calendar",
  documents: "Documents",
  "follow-ups": "Follow-ups",
  "call-prep": "Call prep",
  automations: "Automations",
  team: "Admins",
  settings: "Settings",
  search: "Search",
}

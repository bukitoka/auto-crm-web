import {
  Building2,
  CheckSquare,
  Handshake,
  LayoutDashboard,
  type LucideIcon,
  MessagesSquare,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Workflow,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const mainNav: NavItem[] = [
  { title: "Assistant", href: "/assistant", icon: Sparkles },
  { title: "Insights", href: "/dashboard", icon: LayoutDashboard },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
];

export const secondaryNav: NavItem[] = [
  { title: "AI chats", href: "/ai-chats", icon: MessagesSquare, adminOnly: true },
  { title: "Automations", href: "/automations", icon: Workflow, adminOnly: true },
  { title: "Team", href: "/team", icon: UserCog, adminOnly: true },
  { title: "Settings", href: "/settings", icon: Settings },
];

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
  automations: "Automations",
  team: "Team",
  settings: "Settings",
  search: "Search",
};

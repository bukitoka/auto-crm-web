import { CalendarClock, type LucideIcon, Mail, Phone, StickyNote } from "lucide-react";
import type { ActivityType } from "../types";

const icons: Record<ActivityType, LucideIcon> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  meeting: CalendarClock,
};

export function ActivityIcon({ type }: { type: ActivityType }) {
  const Icon = icons[type] ?? StickyNote;
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground ring-4 ring-background">
      <Icon className="size-4" />
    </span>
  );
}

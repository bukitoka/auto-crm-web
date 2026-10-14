import type { AssistantAction, Conversation, PageContext } from "./types";

const DETAIL_PAGE = /^\/(contacts|companies|deals)\/([0-9a-f-]{36})$/;
const TYPES = { contacts: "contact", companies: "company", deals: "deal" } as const;

/** `/contacts/<id>` → `{type: "contact", id}`; other pages have no context. */
export function pageContextFromPath(pathname: string): PageContext | null {
  const match = DETAIL_PAGE.exec(pathname);
  if (!match) return null;
  return { type: TYPES[match[1] as keyof typeof TYPES], id: match[2] };
}

/** Where to open a record the assistant touched (tasks/activities link to their contact or deal). */
export function actionHref(action: AssistantAction): string {
  const entity = action.link_entity ?? action.entity;
  const id = action.link_id ?? action.entity_id;
  switch (entity) {
    case "contact":
      return `/contacts/${id}`;
    case "company":
      return `/companies/${id}`;
    case "deal":
      return `/deals/${id}`;
    default:
      return "/tasks";
  }
}

/** Group conversations for the history list: Today, Yesterday, Previous 7 days, Older. */
export function groupByDate(
  conversations: Conversation[],
  now = new Date(),
): { label: string; items: Conversation[] }[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  const buckets: [string, (time: number) => boolean][] = [
    ["Today", (t) => t >= startOfToday],
    ["Yesterday", (t) => t >= startOfToday - day],
    ["Previous 7 days", (t) => t >= startOfToday - 7 * day],
    ["Older", () => true],
  ];
  const groups = buckets.map(([label]) => ({ label, items: [] as Conversation[] }));
  for (const conversation of conversations) {
    const time = new Date(conversation.last_message_at).getTime();
    const index = buckets.findIndex(([, matches]) => matches(time));
    groups[index].items.push(conversation);
  }
  return groups.filter((group) => group.items.length > 0);
}

/** "Good morning" / "Good afternoon" / "Good evening" for the assistant home. */
export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

import { describe, expect, it } from "vitest";
import { actionHref, greeting, groupByDate, pageContextFromPath } from "./context";
import type { AssistantAction, Conversation } from "./types";

const id = "01a133fe-b59b-7501-8708-5e2e01a850be";

describe("pageContextFromPath", () => {
  it("recognises contact, company and deal pages", () => {
    expect(pageContextFromPath(`/contacts/${id}`)).toEqual({ type: "contact", id });
    expect(pageContextFromPath(`/companies/${id}`)).toEqual({ type: "company", id });
    expect(pageContextFromPath(`/deals/${id}`)).toEqual({ type: "deal", id });
  });

  it("has no context on list pages", () => {
    expect(pageContextFromPath("/contacts")).toBeNull();
    expect(pageContextFromPath("/dashboard")).toBeNull();
    expect(pageContextFromPath("/contacts/not-an-id")).toBeNull();
  });
});

describe("actionHref", () => {
  const action: AssistantAction = {
    kind: "created",
    entity: "task",
    entity_id: "task-1",
    label: "Task",
    link_entity: null,
    link_id: null,
  };

  it("links tasks and activities to their contact or deal", () => {
    expect(actionHref({ ...action, link_entity: "contact", link_id: "c1" })).toBe("/contacts/c1");
    expect(actionHref({ ...action, link_entity: "deal", link_id: "d1" })).toBe("/deals/d1");
  });

  it("links records to their own page, and loose tasks to /tasks", () => {
    expect(actionHref({ ...action, entity: "company", entity_id: "co1" })).toBe("/companies/co1");
    expect(actionHref(action)).toBe("/tasks");
  });
});

describe("groupByDate", () => {
  const now = new Date(2026, 9, 14, 15, 0);
  const chat = (id: string, last: Date) =>
    ({ id, last_message_at: last.toISOString() }) as Conversation;

  it("puts chats under Today, Yesterday, Previous 7 days and Older", () => {
    const groups = groupByDate(
      [
        chat("a", new Date(2026, 9, 14, 9)),
        chat("b", new Date(2026, 9, 13, 20)),
        chat("c", new Date(2026, 9, 10)),
        chat("d", new Date(2026, 8, 1)),
      ],
      now,
    );

    expect(groups.map((g) => [g.label, g.items.map((c) => c.id)])).toEqual([
      ["Today", ["a"]],
      ["Yesterday", ["b"]],
      ["Previous 7 days", ["c"]],
      ["Older", ["d"]],
    ]);
  });

  it("leaves out empty groups", () => {
    expect(groupByDate([chat("a", now)], now).map((g) => g.label)).toEqual(["Today"]);
  });
});

describe("greeting", () => {
  it("follows the time of day", () => {
    expect(greeting(new Date(2026, 0, 1, 8))).toBe("Good morning");
    expect(greeting(new Date(2026, 0, 1, 13))).toBe("Good afternoon");
    expect(greeting(new Date(2026, 0, 1, 21))).toBe("Good evening");
  });
});

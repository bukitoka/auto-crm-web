import { describe, expect, it } from "vitest";
import { mainNav, secondaryNav, visibleNav } from "./nav-items";

const titles = (items: { title: string }[]) => items.map((item) => item.title);

describe("visibleNav", () => {
  it("shows the super admin the team, automations and chat oversight pages", () => {
    expect(titles(visibleNav(secondaryNav, { is_super_admin: true }))).toEqual([
      "AI chats",
      "Automations",
      "Admins",
      "Settings",
    ]);
  });

  it("hides them from admins", () => {
    expect(titles(visibleNav(secondaryNav, { is_super_admin: false }))).toEqual(["Settings"]);
  });

  it("shows the CRM pages to everyone", () => {
    expect(visibleNav(mainNav, { is_super_admin: false })).toHaveLength(mainNav.length);
  });
});

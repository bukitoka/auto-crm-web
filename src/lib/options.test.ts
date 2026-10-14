import { describe, expect, it } from "vitest";
import { enumOptions, toOptions } from "./options";

describe("toOptions", () => {
  it("maps items to { value: id, label }", () => {
    const users = [
      { id: "u1", full_name: "Jane Doe" },
      { id: "u2", full_name: "John Roe" },
    ];

    expect(toOptions(users, (user) => user.full_name)).toEqual([
      { value: "u1", label: "Jane Doe" },
      { value: "u2", label: "John Roe" },
    ]);
  });
});

describe("enumOptions", () => {
  it("capitalizes values and replaces underscores with spaces", () => {
    expect(enumOptions(["lead", "in_progress", "web_form"])).toEqual([
      { value: "lead", label: "Lead" },
      { value: "in_progress", label: "In progress" },
      { value: "web_form", label: "Web form" },
    ]);
  });

  it("handles an empty string", () => {
    expect(enumOptions([""])).toEqual([{ value: "", label: "" }]);
  });
});

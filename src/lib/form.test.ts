import { describe, expect, it } from "vitest";
import { emptyToNull } from "./form";

describe("emptyToNull", () => {
  it("turns empty and whitespace-only strings into null", () => {
    expect(emptyToNull({ a: "", b: "   ", c: "value" })).toEqual({ a: null, b: null, c: "value" });
  });

  it("keeps non-string values as they are", () => {
    const tags = ["vip"];
    expect(emptyToNull({ count: 0, active: false, tags, missing: null })).toEqual({
      count: 0,
      active: false,
      tags,
      missing: null,
    });
  });

  it("does not trim non-empty strings", () => {
    expect(emptyToNull({ name: " Jane " })).toEqual({ name: " Jane " });
  });
});

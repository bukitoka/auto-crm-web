import { describe, expect, it } from "vitest";
import { checkHeaders, parseHeaderLine } from "./csv-header";

describe("parseHeaderLine", () => {
  it("reads the first line only, like the API does", () => {
    expect(parseHeaderLine("First Name,Email\nJane,jane@acme.com\n")).toEqual([
      "first_name",
      "email",
    ]);
  });

  it("drops a byte order mark and handles quoted cells", () => {
    expect(parseHeaderLine('﻿"Name","Job Title"\r\nx,y')).toEqual(["name", "job_title"]);
  });

  it("returns nothing for an empty file", () => {
    expect(parseHeaderLine("")).toEqual([]);
  });
});

describe("checkHeaders", () => {
  it("separates missing, ignored and recognized columns", () => {
    expect(checkHeaders(["email", "nickname"], ["first_name", "email"], ["first_name"])).toEqual({
      missing: ["first_name"],
      ignored: ["nickname"],
      recognized: ["email"],
    });
  });
});

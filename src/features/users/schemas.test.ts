import { describe, expect, it } from "vitest";
import { adminCreateSchema, emptyAdminForm } from "./schemas";

const valid = { full_name: "Jane Doe", email: "jane@acme.com", password: "secret123" };

describe("adminCreateSchema", () => {
  it("accepts a name, email and password", () => {
    expect(adminCreateSchema.safeParse(valid).success).toBe(true);
  });

  it("requires a name, a valid email and 8+ characters", () => {
    const result = adminCreateSchema.safeParse({ ...emptyAdminForm, email: "jane", password: "x" });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Name is required",
      "Enter a valid email",
      "At least 8 characters",
    ]);
  });
});

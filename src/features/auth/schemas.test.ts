import { describe, expect, it } from "vitest";
import { loginSchema, type SetupValues, setupSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts an email and password", () => {
    expect(loginSchema.safeParse({ email: "jane@acme.com", password: "x" }).success).toBe(true);
  });

  it("validates the email and requires a password", () => {
    const result = loginSchema.safeParse({ email: "jane", password: "" });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      "Enter a valid email",
      "Password is required",
    ]);
  });
});

describe("setupSchema", () => {
  const valid: SetupValues = {
    full_name: "Jane Doe",
    email: "jane@acme.com",
    password: "secret123",
    confirm_password: "secret123",
  };

  it("accepts valid details", () => {
    expect(setupSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least 8 characters", () => {
    const result = setupSchema.safeParse({
      ...valid,
      password: "short",
      confirm_password: "short",
    });
    expect(result.error?.issues[0]?.message).toBe("At least 8 characters");
  });

  it("reports mismatched passwords on confirm_password", () => {
    const result = setupSchema.safeParse({ ...valid, confirm_password: "different1" });
    expect(result.error?.issues[0]).toMatchObject({
      message: "Passwords do not match",
      path: ["confirm_password"],
    });
  });

  it("requires a name", () => {
    const result = setupSchema.safeParse({ ...valid, full_name: "  " });
    expect(result.error?.issues[0]?.message).toBe("Name is required");
  });
});

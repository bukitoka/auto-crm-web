import { describe, expect, it } from "vitest";
import { makeTask } from "@/test/factories";
import {
  emptyTaskForm,
  type TaskFormValues,
  taskFormSchema,
  taskToForm,
  toTaskPayload,
} from "./schemas";

const validForm: TaskFormValues = { ...emptyTaskForm(), title: "Call Jane" };

describe("taskFormSchema", () => {
  it("accepts a valid form", () => {
    expect(taskFormSchema.safeParse(validForm).success).toBe(true);
  });

  it("requires a title", () => {
    const result = taskFormSchema.safeParse({ ...validForm, title: "  " });
    expect(result.error?.issues[0]?.message).toBe("Title is required");
  });

  it("rejects unknown priorities and statuses", () => {
    const badPriority = { ...validForm, priority: "urgent" } as unknown as TaskFormValues;
    const badStatus = { ...validForm, status: "blocked" } as unknown as TaskFormValues;
    expect(taskFormSchema.safeParse(badPriority).success).toBe(false);
    expect(taskFormSchema.safeParse(badStatus).success).toBe(false);
  });
});

describe("emptyTaskForm", () => {
  it("defaults to a medium-priority todo", () => {
    expect(emptyTaskForm()).toMatchObject({ priority: "medium", status: "todo" });
  });

  it("links the task to a contact or deal", () => {
    expect(emptyTaskForm({ contactId: "c1", dealId: "d1" })).toMatchObject({
      contact_id: "c1",
      deal_id: "d1",
    });
  });
});

describe("toTaskPayload", () => {
  it("turns empty strings into null", () => {
    expect(toTaskPayload({ ...validForm, due_date: "2026-03-10", contact_id: "c1" })).toEqual({
      title: "Call Jane",
      description: null,
      due_date: "2026-03-10",
      priority: "medium",
      status: "todo",
      contact_id: "c1",
      deal_id: null,
    });
  });
});

describe("taskToForm", () => {
  it("maps API nulls to empty strings and trims the due date", () => {
    const task = makeTask({ due_date: "2026-03-10T00:00:00Z", deal_id: "d1", priority: "high" });

    expect(taskToForm(task)).toEqual({
      title: "Call Jane",
      description: "",
      due_date: "2026-03-10",
      priority: "high",
      status: "todo",
      contact_id: "",
      deal_id: "d1",
    });
  });
});

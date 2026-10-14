"use client";

import { type ReactNode, useState, useTransition } from "react";
import { FormDialog } from "@/components/shared/form-dialog";
import { toastResult } from "@/lib/toast-result";
import { createTask, updateTask } from "../actions";
import { emptyTaskForm, type TaskFormValues, taskToForm } from "../schemas";
import type { Task } from "../types";
import { TaskForm, type TaskFormOptions } from "./task-form";

type TaskFormDialogProps = TaskFormOptions & {
  task?: Task;
  initialValues?: Partial<TaskFormValues>;
  trigger: ReactNode;
};

export function TaskFormDialog({ task, initialValues, trigger, ...options }: TaskFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultValues = task ? taskToForm(task) : { ...emptyTaskForm(), ...initialValues };

  function handleSubmit(values: TaskFormValues) {
    startTransition(async () => {
      const result = task ? await updateTask(task.id, values) : await createTask(values);
      if (toastResult(result, task ? "Task updated" : "Task created")) setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title={task ? "Edit task" : "New task"}
      formId="task-form"
      submitLabel={task ? "Save changes" : "Create task"}
      isPending={isPending}
    >
      <TaskForm
        formId="task-form"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        {...options}
      />
    </FormDialog>
  );
}

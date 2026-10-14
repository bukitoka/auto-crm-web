"use client";

import { Check, RotateCcw } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toastResult } from "@/lib/toast-result";
import { setTaskStatus } from "../actions";
import type { TaskStatus } from "../types";

/** Quick complete / reopen toggle. */
export function CompleteTaskButton({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const [isPending, startTransition] = useTransition();
  const isDone = status === "done";
  const label = isDone ? "Reopen task" : "Mark as done";

  function toggle() {
    startTransition(async () => {
      const result = await setTaskStatus(taskId, isDone ? "todo" : "done");
      toastResult(result, isDone ? "Task reopened" : "Task completed");
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isDone ? "ghost" : "outline"}
          size="icon-sm"
          onClick={toggle}
          disabled={isPending}
          aria-label={label}
        >
          {isPending ? <Spinner /> : isDone ? <RotateCcw /> : <Check />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

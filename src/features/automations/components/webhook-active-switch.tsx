"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toastResult } from "@/lib/toast-result";
import { toggleWebhook } from "../actions";

export function WebhookActiveSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(isActive);
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      setOptimistic(checked);
      const result = await toggleWebhook(id, checked);
      toastResult(result, checked ? "Subscription enabled" : "Subscription paused");
    });
  }

  return (
    <Switch
      checked={optimistic}
      onCheckedChange={handleChange}
      disabled={isPending}
      aria-label="Active"
    />
  );
}

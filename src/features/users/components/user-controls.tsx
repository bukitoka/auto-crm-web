"use client";

import { useOptimistic, useTransition } from "react";
import { ComboboxSelect } from "@/components/shared/combobox-select";
import { Switch } from "@/components/ui/switch";
import { enumOptions } from "@/lib/options";
import { toastResult } from "@/lib/toast-result";
import { updateUser } from "../actions";
import { USER_ROLES } from "../roles";
import type { UserRole } from "../types";

const ROLE_OPTIONS = enumOptions(USER_ROLES);

export function UserRoleSelect({
  id,
  role,
  disabled,
}: {
  id: string;
  role: UserRole;
  disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(role);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    if (!value || value === optimistic) return;
    startTransition(async () => {
      setOptimistic(value as UserRole);
      toastResult(await updateUser(id, { role: value as UserRole }), "Role updated");
    });
  }

  return (
    <ComboboxSelect
      options={ROLE_OPTIONS}
      value={optimistic}
      onChange={handleChange}
      disabled={disabled || isPending}
      aria-label="Role"
      className="w-40"
    />
  );
}

export function UserActiveSwitch({
  id,
  isActive,
  disabled,
}: {
  id: string;
  isActive: boolean;
  disabled?: boolean;
}) {
  const [optimistic, setOptimistic] = useOptimistic(isActive);
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      setOptimistic(checked);
      const result = await updateUser(id, { is_active: checked });
      toastResult(result, checked ? "User activated" : "User deactivated");
    });
  }

  return (
    <Switch
      checked={optimistic}
      onCheckedChange={handleChange}
      disabled={disabled || isPending}
      aria-label="Active"
    />
  );
}

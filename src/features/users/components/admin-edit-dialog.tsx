"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import { toastResult } from "@/lib/toast-result";
import { updateAdmin } from "../actions";
import { type AdminEditValues, adminEditSchema } from "../schemas";
import type { User } from "../types";

function valuesOf(user: User): AdminEditValues {
  return { full_name: user.full_name, email: user.email, password: "" };
}

export function AdminEditDialog({ user, trigger }: { user: User; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<AdminEditValues>({
    resolver: zodResolver(adminEditSchema),
    defaultValues: valuesOf(user),
  });

  function handleOpenChange(next: boolean) {
    // Start from the saved values each time, so a cancelled edit does not linger.
    if (next) reset(valuesOf(user));
    setOpen(next);
  }

  function onSubmit(values: AdminEditValues) {
    startTransition(async () => {
      const result = await updateAdmin(user.id, values);
      if (toastResult(result, "Admin updated")) setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={trigger}
      title={`Edit ${user.full_name}`}
      description="Changing the email changes the address they log in with."
      formId={`admin-edit-${user.id}`}
      submitLabel="Save changes"
      isPending={isPending}
    >
      <form id={`admin-edit-${user.id}`} onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <TextField control={control} name="full_name" label="Full name" autoComplete="off" />
          <TextField control={control} name="email" label="Email" type="email" autoComplete="off" />
          <TextField
            control={control}
            name="password"
            label="New password"
            type="password"
            autoComplete="new-password"
            description="Leave blank to keep the current password. Share a new one with them directly."
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

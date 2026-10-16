"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { TextField } from "@/components/shared/form-fields";
import { FieldGroup } from "@/components/ui/field";
import { toastResult } from "@/lib/toast-result";
import { createAdmin } from "../actions";
import { type AdminCreateValues, adminCreateSchema, emptyAdminForm } from "../schemas";

export function AdminFormDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit, reset } = useForm<AdminCreateValues>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: emptyAdminForm,
  });

  function onSubmit(values: AdminCreateValues) {
    startTransition(async () => {
      const result = await createAdmin(values);
      if (!toastResult(result, "Admin created")) return;
      reset(emptyAdminForm);
      setOpen(false);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      title="New admin"
      description="Share the password with them directly. They can change it with the forgot password link."
      formId="admin-form"
      submitLabel="Create admin"
      isPending={isPending}
    >
      <form id="admin-form" onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <TextField
            control={control}
            name="full_name"
            label="Full name"
            autoComplete="off"
            autoFocus
          />
          <TextField control={control} name="email" label="Email" type="email" autoComplete="off" />
          <TextField
            control={control}
            name="password"
            label="Temporary password"
            type="password"
            autoComplete="new-password"
            description="At least 8 characters."
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}

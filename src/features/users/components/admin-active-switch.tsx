"use client";

import { type MouseEvent, useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toastResult } from "@/lib/toast-result";
import { updateUser } from "../actions";

type AdminActiveSwitchProps = { id: string; name: string; isActive: boolean };

/** The switch only asks; the account changes once the super admin confirms. */
export function AdminActiveSwitch({ id, name, isActive }: AdminActiveSwitchProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const next = !isActive;

  function handleConfirm(event: MouseEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateUser(id, { is_active: next });
      if (toastResult(result, next ? "Admin activated" : "Admin deactivated")) setOpen(false);
    });
  }

  return (
    <>
      <Switch
        checked={isActive}
        onCheckedChange={() => setOpen(true)}
        aria-label={`Active: ${name}`}
      />
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {next ? `Activate ${name}?` : `Deactivate ${name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {next
                ? "They can log in and work on their records again."
                : "They can no longer log in. Their records stay and you can reactivate them later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={next ? "default" : "destructive"}
              onClick={handleConfirm}
              disabled={isPending}
            >
              {isPending ? <Spinner /> : null}
              {next ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

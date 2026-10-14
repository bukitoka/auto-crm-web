"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { toastResult } from "@/lib/toast-result";

type ConfirmDeleteButtonProps = {
  /** A Server Action with its arguments already bound, e.g. `deleteContact.bind(null, id)`. */
  action: () => Promise<ActionResult>;
  title: string;
  description?: string;
  /** Navigate here after deleting (e.g. back to the list from a detail page). */
  redirectTo?: string;
  variant?: "icon" | "button";
};

export function ConfirmDeleteButton({
  action,
  title,
  description = "This cannot be undone.",
  redirectTo,
  variant = "icon",
}: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm(event: MouseEvent) {
    event.preventDefault(); // keep the dialog open while the action runs
    startTransition(async () => {
      const result = await action();
      if (!toastResult(result, "Deleted")) return;
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon-sm" aria-label={title}>
            <Trash2 />
          </Button>
        ) : (
          <Button variant="destructive">
            <Trash2 />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

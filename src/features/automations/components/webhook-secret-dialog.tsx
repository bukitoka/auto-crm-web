"use client";

import { Copy, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type WebhookSecretDialogProps = {
  secret: string | null;
  onClose: () => void;
};

/** Shown once right after a subscription is created. */
export function WebhookSecretDialog({ secret, onClose }: WebhookSecretDialogProps) {
  async function copy() {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    toast.success("Secret copied");
  }

  return (
    <Dialog open={secret !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4" /> Signing secret
          </DialogTitle>
          <DialogDescription>
            Use it in n8n to verify the <code>X-AutoCRM-Signature</code> header (HMAC-SHA256 of the
            raw body).
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <AlertTitle>Copy it now</AlertTitle>
          <AlertDescription>For security, this secret is only shown once.</AlertDescription>
        </Alert>
        <code className="block rounded-md border bg-muted px-3 py-2 font-mono text-sm break-all">
          {secret}
        </code>
        <DialogFooter>
          <Button variant="outline" onClick={copy}>
            <Copy />
            Copy
          </Button>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

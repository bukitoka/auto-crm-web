"use client";

import { Trash2, Upload } from "lucide-react";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ActionResult } from "@/lib/action-result";
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES } from "@/lib/constants";
import { toastResult } from "@/lib/toast-result";
import { cn } from "@/lib/utils";
import { EntityAvatar } from "./entity-avatar";

type ImageUploadProps = {
  name: string;
  src: string | null;
  shape?: "circle" | "square";
  /** What the picture is, for labels and toasts: "photo", "logo"… */
  label?: string;
  /** Server Action that uploads `formData.get("file")`. */
  onUpload: (formData: FormData) => Promise<ActionResult<unknown>>;
  onRemove: () => Promise<ActionResult<unknown>>;
  className?: string;
};

export function ImageUpload({
  name,
  src,
  shape = "circle",
  label = "photo",
  onUpload,
  onRemove,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow picking the same file again later
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images can be at most 5 MB");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      toastResult(await onUpload(formData), `${capitalize(label)} updated`);
    });
  }

  function handleRemove() {
    startTransition(async () => {
      toastResult(await onRemove(), `${capitalize(label)} removed`);
    });
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <EntityAvatar
          name={name}
          src={src}
          shape={shape}
          className="size-16"
          fallbackClassName="text-lg"
        />
        {isPending ? (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-background/70",
              shape === "square" ? "rounded-md" : "rounded-full",
            )}
          >
            <Spinner />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
          >
            <Upload />
            {src ? `Change ${label}` : `Upload ${label}`}
          </Button>
          {src ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={handleRemove}
            >
              <Trash2 />
              Remove
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF, up to 5 MB.</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        onChange={handleFile}
      />
    </div>
  );
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

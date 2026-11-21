"use client"

import { Trash2, Upload } from "lucide-react"
import { useRef, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/lib/action-result"
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES } from "@/lib/constants"
import { toastResult } from "@/lib/toast-result"
import { cn } from "@/lib/utils"
import { EntityAvatar } from "./entity-avatar"

// Leave room for multipart overhead under Vercel's default 4.5 MB request limit.
const MAX_ACTION_IMAGE_BYTES = 4 * 1024 * 1024

async function prepareImage(file: File): Promise<File> {
  if (file.size <= MAX_ACTION_IMAGE_BYTES) return file

  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const scale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Image canvas unavailable")
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"))
    if (!blob || blob.size > MAX_ACTION_IMAGE_BYTES) throw new Error("Image encoding failed")
    return new File([blob], "upload.png", { type: blob.type })
  } finally {
    URL.revokeObjectURL(url)
  }
}

type ImageUploadProps = {
  name: string
  src: string | null
  shape?: "circle" | "square"
  /** What the picture is, for labels and toasts: "photo", "logo"… */
  label?: string
  /** Server Action that uploads `formData.get("file")`. */
  onUpload: (formData: FormData) => Promise<ActionResult<unknown>>
  onRemove: () => Promise<ActionResult<unknown>>
  /** Show the picture without the upload and remove buttons. */
  readOnly?: boolean
  className?: string
}

export function ImageUpload({
  name,
  src,
  shape = "circle",
  label = "photo",
  onUpload,
  onRemove,
  readOnly = false,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = "" // allow picking the same file again later
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Images can be at most 5 MB")
      return
    }
    startTransition(async () => {
      const image = await prepareImage(file).catch(() => null)
      if (!image) {
        toast.error("Could not resize this image. Try a smaller JPEG, PNG, WebP or GIF.")
        return
      }
      const formData = new FormData()
      formData.set("file", image)
      try {
        toastResult(await onUpload(formData), `${capitalize(label)} updated`)
      } catch {
        toast.error(`Could not upload the ${label}. Please try again.`)
      }
    })
  }

  function handleRemove() {
    startTransition(async () => {
      toastResult(await onRemove(), `${capitalize(label)} removed`)
    })
  }

  if (readOnly) {
    return (
      <div className={className}>
        <EntityAvatar
          name={name}
          src={src}
          shape={shape}
          className="size-16"
          fallbackClassName="text-lg"
        />
      </div>
    )
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
  )
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

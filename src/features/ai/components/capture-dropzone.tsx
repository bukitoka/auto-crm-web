"use client";

import { FileText, ImageIcon, Mail, UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CAPTURE_ACCEPT } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CaptureDropzoneProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
};

function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileIcon({ file }: { file: File }) {
  if (file.type.startsWith("image/")) return <ImageIcon />;
  if (file.name.toLowerCase().endsWith(".eml")) return <Mail />;
  return <FileText />;
}

/** Pasting (⌘/Ctrl+V) is handled by the surrounding dialog, not here. */
export function CaptureDropzone({ file, onFileChange, disabled }: CaptureDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Object URL for image previews; revoked when the file changes.
  useEffect(() => {
    if (!file?.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
        {preview ? (
          // biome-ignore lint/performance/noImgElement: local blob preview, not an optimizable asset
          <img src={preview} alt="" className="size-14 shrink-0 rounded-sm border object-cover" />
        ) : (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground [&>svg]:size-6">
            <FileIcon file={file} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remove file"
          disabled={disabled}
          onClick={() => onFileChange(null)}
        >
          <X />
        </Button>
      </div>
    );
  }

  return (
    <section
      aria-label="Drop a file here"
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const dropped = event.dataTransfer.files[0];
        if (dropped) onFileChange(dropped);
      }}
      className={cn(
        "flex flex-col items-center gap-2 rounded-md border border-dashed p-5 text-center transition-colors",
        isDragging ? "border-primary bg-accent" : "bg-muted/30",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <UploadCloud className="size-5" />
      </span>
      <p className="text-sm font-medium">Drop a file, or paste a screenshot</p>
      <p className="text-xs text-muted-foreground">
        Business card photo, screenshot, PDF, Word, email (.eml) or text file · up to 5 MB
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Browse files
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={CAPTURE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label="Upload a file to capture"
        onChange={(event) => {
          const chosen = event.target.files?.[0];
          event.target.value = "";
          if (chosen) onFileChange(chosen);
        }}
      />
    </section>
  );
}

"use client";

import { Upload } from "lucide-react";
import { type FormEvent, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/lib/action-result";
import { toastResult } from "@/lib/toast-result";
import type { ImportResult } from "@/lib/types";
import { FormDialog } from "./form-dialog";

type ImportCsvDialogProps = {
  /** Plural noun for the title and toasts: "contacts". */
  entity: string;
  /** Accepted columns; the first one is required. Also used for the template file. */
  columns: string[];
  note?: string;
  /** Server Action that imports `formData.get("file")`. */
  action: (formData: FormData) => Promise<ActionResult<ImportResult>>;
};

export function ImportCsvDialog({ entity, columns, note, action }: ImportCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const formId = useId();
  const template = `data:text/csv;charset=utf-8,${encodeURIComponent(`${columns.join(",")}\n`)}`;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setResult(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const response = await action(formData);
      if (!toastResult(response)) return;
      setResult(response.data);
      toast.success(`Imported ${response.data.created} ${entity}`);
    });
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      trigger={
        <Button variant="outline">
          <Upload />
          Import
        </Button>
      }
      title={`Import ${entity}`}
      description="Upload a UTF-8 CSV file (max 2 MB) with a header row."
      formId={formId}
      submitLabel="Import"
      isPending={isPending}
    >
      <form id={formId} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel htmlFor={`${formId}-file`}>CSV file</FieldLabel>
          <Input id={`${formId}-file`} name="file" type="file" accept=".csv,text/csv" />
          <FieldDescription>
            Columns: {columns[0]} (required), {columns.slice(1).join(", ")}. {note}{" "}
            <a
              href={template}
              download={`${entity}-template.csv`}
              className="font-medium text-primary hover:underline"
            >
              Download template
            </a>
          </FieldDescription>
        </Field>
      </form>
      {result ? (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm" role="status">
          <p className="font-medium">
            {result.created} created, {result.skipped} skipped
          </p>
          {result.errors.length > 0 ? (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-muted-foreground">
              {result.errors.map((error) => (
                <li key={error.row}>
                  Row {error.row}: {error.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </FormDialog>
  );
}

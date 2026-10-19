"use client";

import { TriangleAlert, Upload } from "lucide-react";
import { type ChangeEvent, type FormEvent, useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionResult } from "@/lib/action-result";
import { checkHeaders, type HeaderCheck, parseHeaderLine } from "@/lib/csv-header";
import { toastResult } from "@/lib/toast-result";
import type { ImportResult } from "@/lib/types";
import { FormDialog } from "./form-dialog";

/** One CSV column the import reads. */
export type ImportField = {
  name: string;
  required?: boolean;
  /** What the cell may contain, e.g. "Text, up to 100 characters". */
  format: string;
  /** A sample value, shown next to the format. */
  example?: string;
};

type ImportCsvDialogProps = {
  /** Plural noun for the title and toasts: "contacts". */
  entity: string;
  fields: ImportField[];
  /** What happens to rows that match existing records, and similar rules. */
  rules?: string[];
  /** Server Action that imports `formData.get("file")`. */
  action: (formData: FormData) => Promise<ActionResult<ImportResult>>;
};

const HEADER_PEEK_BYTES = 64 * 1024;

export function ImportCsvDialog({ entity, fields, rules = [], action }: ImportCsvDialogProps) {
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [headerCheck, setHeaderCheck] = useState<HeaderCheck | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const names = fields.map((field) => field.name);
  const required = fields.filter((field) => field.required).map((field) => field.name);
  const template = `data:text/csv;charset=utf-8,${encodeURIComponent(`${names.join(",")}\n`)}`;
  const ready =
    acknowledged && file !== null && headerCheck !== null && headerCheck.missing.length === 0;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setAcknowledged(false);
      setFile(null);
      setHeaderCheck(null);
      setResult(null);
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setResult(null);
    if (!chosen) {
      setHeaderCheck(null);
      return;
    }
    const head = await chosen.slice(0, HEADER_PEEK_BYTES).text();
    setHeaderCheck(checkHeaders(parseHeaderLine(head), names, required));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
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
      description="Check that your file matches this format before you upload it."
      formId={formId}
      submitLabel="Import"
      isPending={isPending}
      submitDisabled={!ready}
    >
      <div className="space-y-3 text-sm">
        <p>
          Use a UTF-8 CSV file (max 2 MB). The first row must be a header row with these column
          names. Case does not matter and spaces count as underscores.
        </p>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>What goes in it</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field) => (
                <TableRow key={field.name}>
                  <TableCell className="align-top">
                    <code className="font-mono text-[0.8125rem]">{field.name}</code>
                    {field.required ? (
                      <Badge variant="info" className="ml-2">
                        Required
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">
                    {field.format}
                    {field.example ? (
                      <>
                        {" "}
                        Example: <span className="text-foreground">{field.example}</span>
                      </>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {rules.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        ) : null}
        <p>
          Other columns are ignored, so an export can be imported again.{" "}
          <a
            href={template}
            download={`${entity}-template.csv`}
            className="font-medium text-primary hover:underline"
          >
            Download template
          </a>
        </p>
      </div>

      <Field orientation="horizontal">
        <Checkbox
          id={`${formId}-ack`}
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked === true)}
        />
        <FieldLabel htmlFor={`${formId}-ack`} className="font-normal">
          My file has a header row and follows this format
        </FieldLabel>
      </Field>

      <form id={formId} onSubmit={handleSubmit}>
        <Field>
          <FieldLabel htmlFor={`${formId}-file`}>CSV file</FieldLabel>
          <Input
            id={`${formId}-file`}
            name="file"
            type="file"
            accept=".csv,text/csv"
            disabled={!acknowledged}
            onChange={handleFileChange}
          />
          {acknowledged ? null : (
            <FieldDescription>Confirm the format above to choose a file.</FieldDescription>
          )}
        </Field>
      </form>

      {headerCheck ? <HeaderReport check={headerCheck} /> : null}

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

function HeaderReport({ check }: { check: HeaderCheck }) {
  if (check.missing.length > 0) {
    return (
      <div
        role="alert"
        className="flex gap-2 rounded-md border border-destructive/40 p-3 text-sm text-destructive"
      >
        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
        <p>
          The header row is missing the required column{check.missing.length > 1 ? "s" : ""}:{" "}
          {check.missing.join(", ")}. Fix the file and choose it again.
        </p>
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      Header row looks right: {check.recognized.length} column
      {check.recognized.length === 1 ? "" : "s"} will be read
      {check.ignored.length > 0 ? `, ${check.ignored.join(", ")} will be ignored` : ""}.
    </p>
  );
}

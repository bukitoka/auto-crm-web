"use client"

import { Pencil, Upload } from "lucide-react"
import { type FormEvent, useId, useState, useTransition } from "react"
import { FormDialog } from "@/components/shared/form-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { RecordLinks, RecordOptions } from "@/features/workspace/record-links"
import { RecordPicker } from "@/features/workspace/record-picker"
import { DOCUMENT_ACCEPT, IMAGE_ACCEPT } from "@/lib/constants"
import { toastResult } from "@/lib/toast-result"
import { saveDocument } from "./mutations"
import type { SavedDocument } from "./types"

export function DocumentDialog({
  document,
  initial,
  options,
}: {
  document?: SavedDocument
  initial?: RecordLinks
  options: RecordOptions
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const id = useId()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    startTransition(async () => {
      if (
        toastResult(
          await saveDocument(document?.id ?? null, form),
          document ? "Document updated" : "Document uploaded",
        )
      )
        setOpen(false)
    })
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title={document ? "Edit document details" : "Upload document"}
      description={document?.filename}
      formId={id}
      isPending={pending}
      submitLabel={document ? "Save changes" : "Upload"}
      trigger={
        document ? (
          <Button variant="ghost" size="icon-sm" aria-label={`Edit ${document.filename}`}>
            <Pencil />
          </Button>
        ) : (
          <Button>
            <Upload /> Upload document
          </Button>
        )
      }
    >
      <form id={id} onSubmit={submit}>
        <FieldGroup>
          {document ? null : (
            <Field>
              <FieldLabel htmlFor={`${id}-file`}>File</FieldLabel>
              <Input
                id={`${id}-file`}
                name="file"
                type="file"
                accept={`${IMAGE_ACCEPT},${DOCUMENT_ACCEPT}`}
                aria-describedby={`${id}-help`}
                required
                className="cursor-pointer truncate py-1 pr-3 pl-1 file:mr-2 file:h-8 file:rounded-full file:bg-secondary file:px-3 file:text-secondary-foreground"
              />
              <FieldDescription id={`${id}-help`}>
                Pictures, PDF, Word, email or text files up to 4 MB.
              </FieldDescription>
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`${id}-notes`}>Notes</FieldLabel>
            <Textarea
              id={`${id}-notes`}
              name="notes"
              defaultValue={document?.notes ?? ""}
              maxLength={1000}
            />
          </Field>
          <RecordPicker initial={document ?? initial} options={options} />
        </FieldGroup>
      </form>
    </FormDialog>
  )
}

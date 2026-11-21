"use client"

import { useId, useState } from "react"
import { ComboboxSelect } from "@/components/shared/combobox-select"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  type RecordKind,
  type RecordLinks,
  type RecordOptions,
  recordKinds,
  recordLabels,
  recordLink,
} from "./record-links"

const kinds = recordKinds.map((value) => ({ value, label: recordLabels[value] }))

export function RecordPicker({
  initial,
  options,
}: {
  initial?: RecordLinks
  options: RecordOptions
}) {
  const linked = recordLink(initial ?? {})
  const [kind, setKind] = useState<RecordKind | "">(linked?.kind ?? "")
  const [id, setId] = useState(linked?.id ?? "")
  const labelId = useId()
  const targets = kind ? options[kind] : []
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor={`${labelId}-kind`}>Link to a record</FieldLabel>
        <ComboboxSelect
          id={`${labelId}-kind`}
          options={kinds}
          value={kind}
          onChange={(value) => {
            setKind(value as RecordKind | "")
            setId("")
          }}
          placeholder="No linked record"
          clearable
        />
      </Field>
      {kind ? (
        <Field>
          <FieldLabel htmlFor={`${labelId}-record`}>{recordLabels[kind]}</FieldLabel>
          <ComboboxSelect
            id={`${labelId}-record`}
            options={
              id && !targets.some((option) => option.value === id)
                ? [{ value: id, label: "Linked record" }, ...targets]
                : targets
            }
            value={id}
            onChange={setId}
            placeholder={`Choose a ${recordLabels[kind].toLowerCase()}`}
            clearable
          />
        </Field>
      ) : null}
      {recordKinds.map((key) => (
        <input key={key} type="hidden" name={`${key}_id`} value={kind === key ? id : ""} />
      ))}
    </div>
  )
}

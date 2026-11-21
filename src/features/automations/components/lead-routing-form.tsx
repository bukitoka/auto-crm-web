"use client"

import { type FormEvent, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import type { ActionResult } from "@/lib/action-result"
import { toastResult } from "@/lib/toast-result"

export function LeadRoutingForm({
  settings,
  save,
}: {
  settings: { enabled: boolean; response_hours: number }
  save: (form: FormData) => Promise<ActionResult<unknown>>
}) {
  const [pending, start] = useTransition()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    start(async () => {
      toastResult(await save(form), "Lead routing saved")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead routing</CardTitle>
        <CardDescription>
          Distribute new integration leads that arrive without an owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <Field orientation="horizontal" className="w-fit pb-2">
            <Switch id="lead-routing-enabled" name="enabled" defaultChecked={settings.enabled} />
            <FieldLabel htmlFor="lead-routing-enabled">Round robin</FieldLabel>
          </Field>
          <Field className="w-fit">
            <FieldLabel htmlFor="lead-response-hours">First response target (hours)</FieldLabel>
            <Input
              id="lead-response-hours"
              name="response_hours"
              type="number"
              min={1}
              max={168}
              step={1}
              defaultValue={settings.response_hours}
              required
            />
          </Field>
          <Button type="submit" disabled={pending}>
            {pending ? <Spinner /> : null} Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

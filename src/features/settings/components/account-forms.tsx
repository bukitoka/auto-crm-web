"use client"

import { type SubmitEvent, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { changeMyPassword, updateMyProfile } from "@/features/users/actions"
import { toastResult } from "@/lib/toast-result"

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [pending, startTransition] = useTransition()

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    startTransition(async () => {
      toastResult(
        await updateMyProfile({ full_name: String(values.get("full_name")) }),
        "Name updated",
      )
    })
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="account-name">Full name</FieldLabel>
          <Input
            id="account-name"
            name="full_name"
            autoComplete="name"
            defaultValue={name}
            maxLength={200}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="account-email">Sign-in email</FieldLabel>
          <Input id="account-email" type="email" value={email} readOnly />
          <FieldDescription>
            Contact your workspace super admin to change your sign-in email.
          </FieldDescription>
        </Field>
        <Button type="submit" disabled={pending} className="self-start">
          {pending && <Spinner />}
          Save name
        </Button>
      </FieldGroup>
    </form>
  )
}

export function PasswordForm() {
  const [pending, startTransition] = useTransition()

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    startTransition(async () => {
      const result = await changeMyPassword({
        current_password: String(values.get("current_password")),
        password: String(values.get("password")),
        confirmation: String(values.get("confirmation")),
      })
      if (result.ok) form.reset()
      toastResult(result, "Password changed")
    })
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="current-password">Current password</FieldLabel>
          <Input
            id="current-password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="new-password">New password</FieldLabel>
          <Input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            aria-describedby="new-password-hint"
            required
          />
          <FieldDescription id="new-password-hint">Use at least 8 characters.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Confirm new password</FieldLabel>
          <Input
            id="confirm-password"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
        </Field>
        <Button type="submit" disabled={pending} className="self-start">
          {pending && <Spinner />}
          Change password
        </Button>
      </FieldGroup>
    </form>
  )
}

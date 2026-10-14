"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheckIcon } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { requestPasswordReset } from "../actions";
import { type ForgotPasswordValues, forgotPasswordSchema } from "../schemas";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordValues) {
    startTransition(async () => {
      const result = await requestPasswordReset(values);
      if (toastResult(result)) setSentTo(values.email);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
      </div>
      {sentTo ? (
        <Alert>
          <MailCheckIcon />
          <AlertTitle>Check your inbox</AlertTitle>
          <AlertDescription>
            If {sentTo} has an account, a reset link is on its way.
          </AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            {sentTo ? "Send again" : "Send reset link"}
          </Button>
          <FieldDescription className="text-center">
            Remembered it? <Link href="/login">Back to log in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

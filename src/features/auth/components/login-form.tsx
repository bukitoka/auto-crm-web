"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { login } from "../actions";
import { type LoginValues, loginSchema } from "../schemas";

type LoginFormProps = {
  from?: string;
  /** The session expired (redirected from /logout). */
  expired?: boolean;
  /** The password was just reset. */
  reset?: boolean;
};

export function LoginForm({ from, expired, reset }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginValues) {
    startTransition(async () => {
      // On success the action redirects; we only get a result back on failure.
      const result = await login(values, from);
      toastResult(result);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Log in to your workspace</p>
      </div>
      {expired ? (
        <Alert>
          <AlertDescription>Your session expired. Please log in again.</AlertDescription>
        </Alert>
      ) : null}
      {reset ? (
        <Alert>
          <AlertDescription>Your password was changed. Log in with the new one.</AlertDescription>
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
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                {...field}
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
            </Field>
          )}
        />
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Log in
          </Button>
          <FieldDescription className="text-center">
            No account yet? <Link href="/register">Create one</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

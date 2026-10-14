"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toastResult } from "@/lib/toast-result";
import { register } from "../actions";
import { type RegisterValues, registerSchema } from "../schemas";

const fields = [
  { name: "full_name", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "email" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  {
    name: "confirm_password",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
] as const;

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  });

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await register(values);
      toastResult(result);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          The first account becomes the workspace admin.
        </p>
      </div>
      <FieldGroup>
        {fields.map((config) => (
          <Controller
            key={config.name}
            name={config.name}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={config.name}>{config.label}</FieldLabel>
                <Input
                  {...field}
                  id={config.name}
                  type={config.type}
                  autoComplete={config.autoComplete}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
              </Field>
            )}
          />
        ))}
        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? <Spinner /> : null}
            Create account
          </Button>
          <FieldDescription className="text-center">
            Already have an account? <Link href="/login">Log in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}

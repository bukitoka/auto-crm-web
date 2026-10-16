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
import { register, setUpWorkspace } from "../actions";
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

const copy = {
  register: {
    title: "Create your account",
    description: "New accounts start as members. An admin can change your role later.",
    submit: "Create account",
  },
  setup: {
    title: "Set up your workspace",
    description:
      "Create the super admin account. It can manage everything, including who becomes an admin. You only do this once.",
    submit: "Create super admin",
  },
};

/** `setup` is the one-time first-run page; the API refuses it once a super admin exists. */
export function RegisterForm({ mode = "register" }: { mode?: "register" | "setup" }) {
  const text = copy[mode];
  const [isPending, startTransition] = useTransition();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "", confirm_password: "" },
  });

  function onSubmit(values: RegisterValues) {
    startTransition(async () => {
      const result = await (mode === "setup" ? setUpWorkspace : register)(values);
      toastResult(result);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{text.title}</h1>
        <p className="text-sm text-muted-foreground">{text.description}</p>
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
            {text.submit}
          </Button>
          {mode === "register" ? (
            <FieldDescription className="text-center">
              Already have an account? <Link href="/login">Log in</Link>
            </FieldDescription>
          ) : null}
        </Field>
      </FieldGroup>
    </form>
  );
}

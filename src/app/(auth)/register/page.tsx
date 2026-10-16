import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSetupStatus } from "@/features/auth/api";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  if ((await getSetupStatus()).needs_setup) redirect("/setup");
  return <RegisterForm />;
}

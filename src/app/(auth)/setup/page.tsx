import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSetupStatus } from "@/features/auth/api";
import { SetupForm } from "@/features/auth/components/setup-form";

export const metadata: Metadata = { title: "Set up your workspace" };

export default async function SetupPage() {
  if (!(await getSetupStatus()).needs_setup) redirect("/login");
  return <SetupForm />;
}

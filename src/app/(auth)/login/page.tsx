import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSetupStatus } from "@/features/auth/api";
import { LoginForm } from "@/features/auth/components/login-form";
import { getParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // A brand-new install has nobody to log in as: create the super admin first.
  if ((await getSetupStatus()).needs_setup) redirect("/setup");
  const params = await searchParams;
  return (
    <LoginForm
      from={getParam(params, "from")}
      expired={getParam(params, "expired") === "1"}
      reset={getParam(params, "reset") === "1"}
    />
  );
}

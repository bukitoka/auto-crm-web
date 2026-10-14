import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { getParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  return (
    <LoginForm
      from={getParam(params, "from")}
      expired={getParam(params, "expired") === "1"}
      reset={getParam(params, "reset") === "1"}
    />
  );
}

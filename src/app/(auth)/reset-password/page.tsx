import type { Metadata } from "next";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getParam } from "@/lib/search-params";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const token = getParam(await searchParams, "token");
  if (!token) {
    return (
      <Alert variant="destructive">
        <AlertTitle>This link is incomplete</AlertTitle>
        <AlertDescription>
          Open the link from the email again, or{" "}
          <Link href="/forgot-password">request a new one</Link>.
        </AlertDescription>
      </Alert>
    );
  }
  return <ResetPasswordForm token={token} />;
}

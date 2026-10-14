"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function RootError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <ErrorState {...props} />
    </main>
  );
}

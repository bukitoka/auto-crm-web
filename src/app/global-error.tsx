"use client";

import "./globals.css";

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <button
          type="button"
          className="rounded-full bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => retry()}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

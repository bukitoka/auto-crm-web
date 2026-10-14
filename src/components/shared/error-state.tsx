"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

type ErrorStateProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

/** Shared body for `error.tsx` files. */
export function ErrorState({ error, retry }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={TriangleAlert}
      title="Something went wrong"
      description="We couldn't load this page. Check that the API server is running, then try again."
      action={<Button onClick={() => retry()}>Try again</Button>}
    />
  );
}

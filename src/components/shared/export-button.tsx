"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Goes through `/export/<entity>` so the session token stays server-side. */
export function ExportButton({ entity }: { entity: "contacts" | "companies" | "deals" | "tasks" }) {
  const params = new URLSearchParams(useSearchParams().toString());
  for (const key of ["page", "size", "view"]) params.delete(key);
  const query = params.toString();

  return (
    <Button variant="outline" asChild>
      <a href={`/export/${entity}${query ? `?${query}` : ""}`} download>
        <Download />
        Export
      </a>
    </Button>
  );
}

"use client";

import { Eye } from "lucide-react";
import { usePathname } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CRM_PATHS = ["/contacts", "/companies", "/deals", "/tasks"];

export function isCrmPath(pathname: string) {
  return CRM_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Shown to the super admin on CRM pages, where their access is view-only. */
export function ReadOnlyBanner() {
  const pathname = usePathname();
  if (!isCrmPath(pathname)) return null;

  return (
    <Alert>
      <Eye />
      <AlertTitle>Read-only view</AlertTitle>
      <AlertDescription>
        You can browse every admin's records. Only admins create or change them.
      </AlertDescription>
    </Alert>
  );
}

"use client"

import { type ReactNode, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { ActionResult } from "@/lib/action-result"
import { toastResult } from "@/lib/toast-result"

export function RetryDeliveryButton({
  action,
  children,
}: {
  action: () => Promise<ActionResult<unknown>>
  children: ReactNode
}) {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          toastResult(await action(), "Webhook delivered")
        })
      }
    >
      {pending ? (
        <>
          <Spinner /> Retrying
        </>
      ) : (
        children
      )}
    </Button>
  )
}

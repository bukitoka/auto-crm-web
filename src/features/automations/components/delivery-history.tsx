import { RotateCw } from "lucide-react"
import { revalidatePath } from "next/cache"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { runAction } from "@/lib/action-result"
import { apiFetch } from "@/lib/api-client"
import { formatDateTime } from "@/lib/format"
import { RetryDeliveryButton } from "./retry-delivery-button"

type Delivery = {
  id: string
  subscription_id: string | null
  event: string
  attempts: number
  delivered: boolean
  status_code: number | null
  error: string | null
  updated_at: string
}

export async function DeliveryHistory() {
  const history = await apiFetch<Delivery[]>("/webhooks/deliveries")

  async function retry(id: string) {
    "use server"
    if (!/^[0-9a-f-]{36}$/.test(id)) return { ok: false as const, error: "Invalid delivery" }
    const result = await runAction(() =>
      apiFetch<Delivery>(`/webhooks/deliveries/${id}/retry`, { method: "POST" }),
    )
    if (result.ok) revalidatePath("/automations")
    return result.ok && !result.data.delivered
      ? { ok: false as const, error: result.data.error ?? "Delivery failed" }
      : result
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery history</CardTitle>
        <CardDescription>Recent webhook deliveries and retry results.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length ? (
          <ul className="divide-y">
            {history.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium wrap-anywhere">{item.event}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.updated_at)} · {item.attempts}{" "}
                    {item.attempts === 1 ? "attempt" : "attempts"}
                    {item.error ? ` · ${item.error}` : ""}
                  </p>
                </div>
                <Badge
                  variant={item.delivered ? "success" : item.attempts ? "destructive" : "secondary"}
                >
                  {item.delivered ? "Delivered" : item.attempts ? "Failed" : "Pending"}
                </Badge>
                {!item.delivered && item.subscription_id ? (
                  <RetryDeliveryButton action={retry.bind(null, item.id)}>
                    <RotateCw /> Retry
                  </RetryDeliveryButton>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No webhook deliveries yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch } from "@/lib/api-client"
import { getParam } from "@/lib/search-params"
import type { SearchParams } from "@/lib/types"

export async function WorkspaceSync({ params }: { params: SearchParams }) {
  const providers = await apiFetch<("google" | "microsoft")[]>("/workspace-sync/providers")
  const sync = getParam(params, "sync")
  const events = Number(getParam(params, "events")) || 0
  const emails = Number(getParam(params, "emails")) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar and email sync</CardTitle>
        <CardDescription>
          Import upcoming meetings and log recent inbox messages that match your contacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sync === "done" ? (
          <p role="status" className="text-sm text-success">
            {events} events added or updated · {emails} emails logged
          </p>
        ) : sync === "failed" || sync === "unavailable" ? (
          <p role="status" className="text-sm text-destructive">
            Sync could not finish. Connect again to retry.
          </p>
        ) : null}
        {providers.length ? (
          <div className="flex flex-wrap gap-2">
            {providers.map((provider) => (
              <Button key={provider} variant="outline" asChild>
                <a href={`/settings/sync/start?provider=${provider}`}>
                  <RefreshCw /> Sync {provider === "google" ? "Google" : "Microsoft"}
                </a>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No sync providers are configured.</p>
        )}
      </CardContent>
    </Card>
  )
}

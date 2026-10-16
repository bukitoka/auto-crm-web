import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function N8nGuide({ events }: { events: string[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="size-4" /> Outbound: CRM → n8n
          </CardTitle>
          <CardDescription>Trigger workflows when something happens in the CRM.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal space-y-1.5 pl-5 text-muted-foreground">
            <li>
              In n8n, add a <strong className="text-foreground">Webhook</strong> trigger node (POST)
              and copy its production URL.
            </li>
            <li>Create a subscription below for the event you care about, pasting that URL.</li>
            <li>
              Copy the signing secret (shown once) and verify the{" "}
              <code className="font-mono text-xs">X-AutoCRM-Signature</code> header, an HMAC-SHA256
              of the raw body.
            </li>
          </ol>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {events.map((event) => (
              <Badge key={event} variant="outline" className="font-mono">
                {event}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownToLine className="size-4" /> Inbound: n8n → CRM
          </CardTitle>
          <CardDescription>Let workflows read and write CRM data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Use an <strong className="text-foreground">HTTP Request</strong> node with the header{" "}
            <code className="font-mono text-xs">X-API-Key</code> set to the API's{" "}
            <code className="font-mono text-xs">AUTOMATION_API_KEY</code>. Every endpoint accepts
            it.
          </p>
          <p>
            Web-form leads go to{" "}
            <code className="font-mono text-xs">POST /api/v1/integrations/leads</code> with{" "}
            <code className="font-mono text-xs">first_name, email</code> and optional{" "}
            <code className="font-mono text-xs">
              last_name, phone, company_name, message, source
            </code>
            .
          </p>
          <p>
            Starter workflows (lead scoring, deal-won alerts, overdue digest, web-form intake) live
            in <code className="font-mono text-xs">auto-crm-automation/workflows/</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

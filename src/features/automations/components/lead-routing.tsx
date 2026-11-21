import { revalidatePath } from "next/cache"
import { z } from "zod"
import { parseInput, runAction } from "@/lib/action-result"
import { apiFetch } from "@/lib/api-client"
import { LeadRoutingForm } from "./lead-routing-form"

const schema = z.object({
  enabled: z.boolean(),
  response_hours: z.number().int().min(1).max(168),
})
type Settings = z.infer<typeof schema>

export async function LeadRouting() {
  const settings = await apiFetch<Settings>("/integrations/lead-routing")

  async function save(form: FormData) {
    "use server"
    const data = parseInput(schema, {
      enabled: form.get("enabled") === "on",
      response_hours: Number(form.get("response_hours")),
    })
    if (!data.ok) return data
    const result = await runAction(() =>
      apiFetch<Settings>("/integrations/lead-routing", {
        method: "PUT",
        body: data.data,
      }),
    )
    if (result.ok) {
      revalidatePath("/automations")
      revalidatePath("/follow-ups")
    }
    return result
  }

  return <LeadRoutingForm settings={settings} save={save} />
}

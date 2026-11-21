import { NextResponse } from "next/server"
import { z } from "zod"
import { ApiError, apiFetch } from "@/lib/api-client"

const providerSchema = z.object({ provider: z.enum(["google", "microsoft"]) })

function providerFromState(state: string) {
  const payload = state.split(".")[1]
  try {
    const result = providerSchema.safeParse(
      JSON.parse(Buffer.from(payload, "base64url").toString()),
    )
    return result.success ? result.data.provider : null
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const callback = new URL(request.url)
  const destination = new URL("/settings", callback)
  const state = callback.searchParams.get("state") ?? ""
  const code = callback.searchParams.get("code")
  const provider = state.length <= 2048 ? providerFromState(state) : null
  destination.searchParams.set("sync", "failed")
  if (provider && code && code.length <= 2048) {
    try {
      const result = await apiFetch<{
        events_added: number
        events_updated: number
        emails_logged: number
      }>(`/workspace-sync/${provider}/complete`, { method: "POST", body: { code, state } })
      destination.searchParams.set("sync", "done")
      destination.searchParams.set("events", String(result.events_added + result.events_updated))
      destination.searchParams.set("emails", String(result.emails_logged))
    } catch (error) {
      if (!(error instanceof ApiError)) throw error
    }
  }
  return NextResponse.redirect(destination)
}

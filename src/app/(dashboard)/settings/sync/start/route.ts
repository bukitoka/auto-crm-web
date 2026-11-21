import { NextResponse } from "next/server"
import { z } from "zod"
import { ApiError, apiFetch } from "@/lib/api-client"

export async function GET(request: Request) {
  const provider = z
    .enum(["google", "microsoft"])
    .safeParse(new URL(request.url).searchParams.get("provider"))
  if (!provider.success) return new Response("Unknown sync provider", { status: 404 })
  try {
    const { url } = await apiFetch<{ url: string }>(`/workspace-sync/${provider.data}/start`, {
      method: "POST",
    })
    return NextResponse.redirect(url)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    return NextResponse.redirect(new URL("/settings?sync=unavailable", request.url))
  }
}

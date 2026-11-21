import { redirect } from "next/navigation"
import { z } from "zod"
import { ApiError, apiFetch } from "@/lib/api-client"

export async function GET(request: Request, { params }: RouteContext<"/documents/[id]/download">) {
  const parsed = z.uuid().safeParse((await params).id)
  if (!parsed.success) return new Response("Document not found", { status: 404 })
  const preview = new URL(request.url).searchParams.get("preview") === "1"
  const download = await apiFetch<{ url: string }>(`/documents/${parsed.data}/download`, {
    query: { preview },
  }).catch((error: unknown) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null
    throw error
  })
  if (!download) return new Response("Document not found", { status: 404 })
  redirect(download.url)
}

"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { readRecordLinks, recordLinksSchema } from "@/features/workspace/record-input"
import { parseInput, runAction } from "@/lib/action-result"
import { apiFetch } from "@/lib/api-client"
import { parseFileUpload } from "@/lib/uploads"
import type { SavedDocument } from "./types"

const metadata = z.object({ notes: z.string().max(1000).nullable(), links: recordLinksSchema })

export async function saveDocument(id: string | null, form: FormData) {
  const identity = parseInput(z.uuid().nullable(), id)
  if (!identity.ok) return identity
  const data = parseInput(metadata, {
    notes: String(form.get("notes") ?? "").trim() || null,
    links: readRecordLinks(form),
  })
  if (!data.ok) return data
  if (identity.data) {
    const result = await runAction(() =>
      apiFetch<SavedDocument>(`/documents/${identity.data}`, {
        method: "PUT",
        body: { ...data.data.links, notes: data.data.notes },
      }),
    )
    if (result.ok) revalidatePath("/documents")
    return result
  }
  const upload = parseFileUpload(form, 4 * 1024 * 1024)
  if (!upload.ok) return upload
  for (const [key, value] of Object.entries({ ...data.data.links, notes: data.data.notes })) {
    if (value) upload.data.set(key, value)
  }
  const result = await runAction(() =>
    apiFetch<SavedDocument>("/documents", { method: "POST", body: upload.data }),
  )
  if (result.ok) revalidatePath("/documents")
  return result
}

export async function deleteDocument(id: string) {
  const parsed = parseInput(z.uuid(), id)
  if (!parsed.ok) return parsed
  const result = await runAction(() =>
    apiFetch<void>(`/documents/${parsed.data}`, { method: "DELETE" }),
  )
  if (result.ok) revalidatePath("/documents")
  return result
}

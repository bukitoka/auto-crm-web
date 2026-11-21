import { revalidatePath } from "next/cache"
import { expect, it, vi } from "vitest"
import { apiFetch } from "@/lib/api-client"
import { deleteDocument, saveDocument } from "./mutations"

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  apiFetch: vi.fn(),
}))

const id = "01a1fda8-a11c-721e-bee0-9fc999b72228"

it("uploads a file with its notes and CRM record link", async () => {
  const form = new FormData()
  form.set("file", new File(["Renewal"], "terms.txt"))
  form.set("notes", "  Annual renewal  ")
  form.set("deal_id", id)

  expect((await saveDocument(null, form)).ok).toBe(true)
  const [path, options] = vi.mocked(apiFetch).mock.calls[0]
  expect(path).toBe("/documents")
  expect(options?.method).toBe("POST")
  expect((options?.body as FormData | undefined)?.get("notes")).toBe("Annual renewal")
  expect((options?.body as FormData | undefined)?.get("deal_id")).toBe(id)
  expect(revalidatePath).toHaveBeenCalledWith("/documents")
})

it("updates metadata, deletes safely, and rejects malformed IDs", async () => {
  const form = new FormData()
  form.set("contact_id", id)
  expect((await saveDocument(id, form)).ok).toBe(true)
  expect(apiFetch).toHaveBeenCalledWith(`/documents/${id}`, {
    method: "PUT",
    body: { contact_id: id, deal_id: null, company_id: null, notes: null },
  })
  expect((await deleteDocument(id)).ok).toBe(true)
  expect(apiFetch).toHaveBeenCalledWith(`/documents/${id}`, { method: "DELETE" })
  expect((await deleteDocument("../users")).ok).toBe(false)
  expect(apiFetch).toHaveBeenCalledTimes(2)
})

it("rejects multiple record links and files larger than 4 MB", async () => {
  const form = new FormData()
  form.set("contact_id", id)
  form.set("deal_id", id)
  expect((await saveDocument(null, form)).ok).toBe(false)
  form.delete("deal_id")
  form.set("file", new File([new Uint8Array(4 * 1024 * 1024 + 1)], "large.txt"))
  expect(await saveDocument(null, form)).toMatchObject({ ok: false, status: 413 })
  expect(apiFetch).not.toHaveBeenCalled()
})

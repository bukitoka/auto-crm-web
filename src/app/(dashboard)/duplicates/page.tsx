import type { Metadata } from "next"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { notFound } from "next/navigation"
import { z } from "zod"
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button"
import { ForbiddenState } from "@/components/shared/forbidden-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/features/auth/api"
import { canWriteCrm } from "@/features/users/roles"
import { runAction } from "@/lib/action-result"
import { ApiError, apiFetch } from "@/lib/api-client"
import { getParam } from "@/lib/search-params"

export const metadata: Metadata = { title: "Review duplicates" }
const type = z.enum(["contact", "company"])
type Candidate = { id: string; name: string; details: string[] }

export default async function DuplicatesPage({ searchParams }: PageProps<"/duplicates">) {
  if (!canWriteCrm(await getCurrentUser())) {
    return <ForbiddenState description="Only the record owner can merge duplicates." />
  }
  const params = await searchParams
  const kind = type.safeParse(getParam(params, "kind"))
  const id = z.uuid().safeParse(getParam(params, "id"))
  if (!kind.success || !id.success) notFound()
  const plural = kind.data === "company" ? "companies" : "contacts"
  const { keep, candidates } = await apiFetch<{ keep: Candidate; candidates: Candidate[] }>(
    `/duplicates/${kind.data}/${id.data}`,
  ).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound()
    throw error
  })

  async function merge(rawKind: string, keepId: string, duplicateId: string) {
    "use server"
    const payload = z
      .object({ kind: type, keep_id: z.uuid(), duplicate_id: z.uuid() })
      .safeParse({ kind: rawKind, keep_id: keepId, duplicate_id: duplicateId })
    if (!payload.success) return { ok: false as const, error: "Select two valid records" }
    const { kind, ...body } = payload.data
    const result = await runAction(() =>
      apiFetch<void>(`/duplicates/${kind}/merge`, { method: "POST", body }),
    )
    if (result.ok) revalidatePath("/", "layout")
    return result
  }

  return (
    <>
      <PageHeader
        title="Review duplicates"
        description="Compare records before merging them."
        actions={
          <Button variant="outline" asChild>
            <Link href={`/${plural}/${keep.id}`}>Back to record</Link>
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Keep {keep.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {keep.details.length ? (
            <p className="text-sm text-muted-foreground">{keep.details.join(" · ")}</p>
          ) : null}
          <p className="mt-2 text-sm">
            The kept record takes priority when details conflict. Linked records and files move to
            it.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Possible duplicates</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length ? (
            <ul className="divide-y">
              {candidates.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <Link href={`/${plural}/${item.id}`} className="font-medium hover:underline">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.details.join(" · ")}</p>
                  </div>
                  <ConfirmDeleteButton
                    action={merge.bind(null, kind.data, keep.id, item.id)}
                    title={`Merge ${item.name} into ${keep.name}?`}
                    description="The duplicate record will be removed after its relationships are moved."
                    variant="button"
                    triggerLabel="Merge"
                    confirmLabel="Merge records"
                    successMessage="Records merged"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No matching records found.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

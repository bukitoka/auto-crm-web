import { Download, FileText, ImageIcon, Sparkles } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { z } from "zod"
import { ConfirmDeleteButton } from "@/components/shared/confirm-delete-button"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DocumentDialog } from "@/features/documents/document-dialog"
import { deleteDocument } from "@/features/documents/mutations"
import type { SavedDocument } from "@/features/documents/types"
import {
  type RecordLinks,
  recordKinds,
  recordLabels,
  recordLink,
} from "@/features/workspace/record-links"
import { getRecordOptions } from "@/features/workspace/record-options"
import { apiFetch } from "@/lib/api-client"
import { formatDate } from "@/lib/format"
import { getParam } from "@/lib/search-params"

export const metadata: Metadata = { title: "Documents" }

export default async function DocumentsPage({ searchParams }: PageProps<"/documents">) {
  const params = await searchParams
  const search = getParam(params, "search")?.slice(0, 200) ?? ""
  const requested = Number(getParam(params, "page") ?? 1)
  const page = Number.isSafeInteger(requested) ? Math.max(1, Math.min(requested, 10000)) : 1
  const links: RecordLinks = {}
  for (const kind of recordKinds) {
    const field = `${kind}_id` as const
    const parsed = z.uuid().safeParse(getParam(params, field))
    if (parsed.success) {
      links[field] = parsed.data
      break
    }
  }
  const linked = recordLink(links)
  const [documents, options] = await Promise.all([
    apiFetch<SavedDocument[]>("/documents", {
      query: { ...links, search, offset: (page - 1) * 25 },
    }),
    getRecordOptions(),
  ])

  function pageHref(next: number) {
    const query = new URLSearchParams({ page: String(next) })
    if (search) query.set("search", search)
    if (linked) query.set(`${linked.kind}_id`, linked.id)
    return `/documents?${query}`
  }

  return (
    <>
      <PageHeader
        title="Documents"
        description="Your private files and pictures."
        actions={<DocumentDialog options={options} initial={links} />}
      />
      <div className="flex flex-wrap items-center gap-2">
        <form className="flex flex-wrap gap-2">
          {linked ? <input type="hidden" name={`${linked.kind}_id`} value={linked.id} /> : null}
          <Input
            name="search"
            aria-label="Search documents"
            placeholder="Search documents"
            defaultValue={search}
            maxLength={200}
            className="w-64 max-w-full"
          />
          <Button variant="outline" type="submit">
            Search
          </Button>
        </form>
        {linked ? (
          <Button asChild variant="outline">
            <Link href="/documents">Show all files</Link>
          </Button>
        ) : null}
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        {documents.length ? (
          <ul className="divide-y">
            {documents.map((document) => {
              const link = recordLink(document)
              const linkedName =
                link && options[link.kind].find((option) => option.value === link.id)?.label
              const Icon = document.content_type.startsWith("image/") ? ImageIcon : FileText
              return (
                <li key={document.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/documents/${document.id}/download${document.content_type.startsWith("image/") ? "?preview=1" : ""}`}
                      target={document.content_type.startsWith("image/") ? "_blank" : undefined}
                      rel="noreferrer"
                      className="font-medium wrap-anywhere underline-offset-2 hover:underline"
                    >
                      {document.filename}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {Math.max(1, Math.round(document.size / 1024))} KB ·{" "}
                      {formatDate(document.created_at)}
                      {link ? (
                        <>
                          {" "}
                          ·{" "}
                          <Link className="underline-offset-2 hover:underline" href={link.href}>
                            {linkedName || recordLabels[link.kind]}
                          </Link>
                        </>
                      ) : null}
                    </p>
                    {document.notes ? (
                      <p className="mt-1 text-sm wrap-anywhere text-muted-foreground">
                        {document.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/assistant?document=${document.id}`}>
                        <Sparkles /> Ask AI
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={`/documents/${document.id}/download`}
                        aria-label={`Download ${document.filename}`}
                      >
                        <Download />
                      </a>
                    </Button>
                    <DocumentDialog document={document} options={options} />
                    <ConfirmDeleteButton
                      action={deleteDocument.bind(null, document.id)}
                      title={`Delete ${document.filename}?`}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            {search ? "No matching documents." : "No documents uploaded yet."}
          </p>
        )}
      </div>
      {page > 1 || documents.length === 25 ? (
        <div className="flex justify-end gap-2">
          {page > 1 ? (
            <Button variant="outline" asChild>
              <Link href={pageHref(page - 1)}>Previous</Link>
            </Button>
          ) : null}
          {documents.length === 25 ? (
            <Button variant="outline" asChild>
              <Link href={pageHref(page + 1)}>Next</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  )
}

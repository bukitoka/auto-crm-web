import type { Option } from "@/components/shared/combobox-select"

export type RecordKind = "contact" | "company" | "deal"
export type RecordLinks = Partial<Record<`${RecordKind}_id`, string | null>>
export type RecordOptions = Record<RecordKind, Option[]>

export const recordKinds = ["contact", "company", "deal"] as const
export const recordLabels = { contact: "Contact", company: "Company", deal: "Deal" } as const

export function recordLink(links: RecordLinks) {
  for (const kind of recordKinds) {
    const id = links[`${kind}_id`]
    if (id) return { kind, id, href: `/${kind === "company" ? "companies" : `${kind}s`}/${id}` }
  }
  return null
}

export function documentsHref(kind: RecordKind, id: string) {
  return `/documents?${kind}_id=${encodeURIComponent(id)}`
}

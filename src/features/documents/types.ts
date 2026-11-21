import type { RecordLinks } from "@/features/workspace/record-links"

export type SavedDocument = RecordLinks & {
  id: string
  filename: string
  notes: string | null
  content_type: string
  size: number
  created_at: string
}

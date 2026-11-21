import "server-only"
import { listCompanyOptions } from "@/features/companies/api"
import { listContactOptions } from "@/features/contacts/api"
import { listDealOptions } from "@/features/deals/api"
import { personName } from "@/lib/format"
import type { RecordOptions } from "./record-links"

export async function getRecordOptions(): Promise<RecordOptions> {
  const [contacts, companies, deals] = await Promise.all([
    listContactOptions(),
    listCompanyOptions(),
    listDealOptions(),
  ])
  return {
    contact: contacts.map((contact) => ({ value: contact.id, label: personName(contact) })),
    company: companies.map((company) => ({ value: company.id, label: company.name })),
    deal: deals.map((deal) => ({ value: deal.id, label: deal.title })),
  }
}

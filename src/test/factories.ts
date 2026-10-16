import type { WebhookSubscription } from "@/features/automations/types";
import type { Company } from "@/features/companies/types";
import type { Contact } from "@/features/contacts/types";
import type { Deal, PipelineStage } from "@/features/deals/types";
import type { Task } from "@/features/tasks/types";
import type { Paginated } from "@/lib/types";

/**
 * Small builders for API objects. Pass only the fields a test cares about:
 *
 *   makeContact({ status: "customer" })
 */

const TIMESTAMP = "2026-01-15T10:00:00Z";

export function makeCompany(overrides: Partial<Company> = {}): Company {
  return {
    id: "company-1",
    name: "Acme Inc",
    domain: null,
    industry: null,
    size: null,
    website: null,
    notes: null,
    logo_url: null,
    owner_id: null,
    owner: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...overrides,
  };
}

export function makeContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: "contact-1",
    first_name: "Jane",
    last_name: "Doe",
    email: "jane@acme.com",
    phone: null,
    job_title: null,
    status: "lead",
    source: "manual",
    tags: [],
    avatar_url: null,
    company_id: null,
    company: null,
    owner_id: null,
    owner: null,
    ai_score: null,
    ai_summary: null,
    ai_scored_at: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...overrides,
  };
}

export function makeStage(overrides: Partial<PipelineStage> = {}): PipelineStage {
  return {
    id: "stage-1",
    name: "Lead",
    position: 1,
    probability: 10,
    is_won: false,
    is_lost: false,
    deal_count: 0,
    ...overrides,
  };
}

export function makeDeal(overrides: Partial<Deal> = {}): Deal {
  return {
    id: "deal-1",
    title: "Website redesign",
    value: "5000.00",
    currency: "USD",
    stage_id: "stage-1",
    stage: { id: "stage-1", name: "Lead", is_won: false, is_lost: false },
    contact_id: null,
    contact: null,
    company_id: null,
    company: null,
    owner_id: null,
    owner: null,
    expected_close_date: null,
    closed_at: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...overrides,
  };
}

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    title: "Call Jane",
    description: null,
    due_date: null,
    priority: "medium",
    status: "todo",
    completed_at: null,
    assignee_id: null,
    assignee: null,
    contact_id: null,
    contact: null,
    deal_id: null,
    deal: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...overrides,
  };
}

export function makeWebhook(overrides: Partial<WebhookSubscription> = {}): WebhookSubscription {
  return {
    id: "webhook-1",
    event: "contact.created",
    target_url: "http://localhost:5678/webhook/new-contact",
    is_active: true,
    secret: null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...overrides,
  };
}

export function makePage<T>(items: T[], overrides: Partial<Paginated<T>> = {}): Paginated<T> {
  return { items, total: items.length, page: 1, size: 20, ...overrides };
}

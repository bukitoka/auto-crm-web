export type ChangelogEntry = {
  /** Release date, ISO 8601 (YYYY-MM-DD). */
  date: string;
  changes: string[];
};

export type Changelog = { web: ChangelogEntry[]; api: ChangelogEntry[] };

/** Shown in the About dialog. The name and links come from the project's git metadata. */
export const appInfo = {
  name: "Auto CRM",
  tagline: "CRM with an AI assistant for small sales teams.",
  developer: {
    name: "Kusuma J.",
    url: "https://github.com/bukitoka",
  },
  repo: {
    web: "https://github.com/bukitoka/auto-crm-web",
    api: "https://github.com/bukitoka/auto-crm-api",
  },
};

/**
 * Used when GitHub cannot be reached. The live changelog is built from each repo's
 * commit history (see changelog.ts), so this only needs a refresh when the API changes.
 */
export const fallbackChangelogs: Changelog = {
  web: [
    {
      date: "2026-10-20",
      changes: ["Toast notifications restyled with neutral surfaces and state icons."],
    },
    {
      date: "2026-10-19",
      changes: [
        "Header search opens a command dialog.",
        "Super admins can edit admin accounts.",
        "Assistant replies render charts, metric cards and tables.",
        "CSV import explains each column before upload.",
      ],
    },
    {
      date: "2026-10-17",
      changes: [
        "Security headers added and the powered-by header removed.",
        "Production builds render per request.",
      ],
    },
    {
      date: "2026-10-16",
      changes: [
        "Roles aligned with superadmin and admin access.",
        "Voice input, team management, CSV export and a pipeline editor.",
      ],
    },
    {
      date: "2026-10-14",
      changes: [
        "First release: auth, dashboard, contacts, companies, deals, tasks, activities, emails, settings, automations, search and the AI assistant.",
      ],
    },
  ],
  api: [
    {
      date: "2026-10-19",
      changes: [
        "Super admins can change an admin's email and password.",
        "Assistant replies can carry charts, metric cards and tables.",
        "/health publishes the deployed version and commit.",
      ],
    },
    {
      date: "2026-10-18",
      changes: [
        "Development mail goes through Mailpit.",
        "Local Whisper speech-to-text endpoint removed.",
      ],
    },
    {
      date: "2026-10-17",
      changes: [
        "Login rate limiting and password reset.",
        "S3 storage and Brevo email.",
        "Connection pooling and production settings validation.",
      ],
    },
    {
      date: "2026-10-16",
      changes: [
        "Role hierarchy reduced to superadmin and admin with scoped access.",
        "Voice assistant, CSV import and export, and pipeline stages.",
      ],
    },
    {
      date: "2026-10-14",
      changes: [
        "First release: auth, CRM modules, AI and document processing, webhooks, integrations and the assistant.",
      ],
    },
  ],
};

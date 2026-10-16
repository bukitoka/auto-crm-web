/** Name of the httpOnly cookie that stores the FastAPI JWT. */
export const SESSION_COOKIE = "acrm_session";

/** Where signed-in users land. */
export const HOME_PATH = "/assistant";

/** Routes that are reachable without a session. */
export const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/setup"];

export const DEFAULT_PAGE_SIZE = 20;

/** Size used when loading options for selects (owner, company, stage pickers). */
export const PICKER_PAGE_SIZE = 100;

/** Image uploads (contact photos, company logos, avatars). Mirrors the API's limits. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/** Smart capture uploads (photos, screenshots, PDF, Word, email, text). Mirrors the API's limit. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const CAPTURE_ACCEPT = "image/*,.pdf,.docx,.eml,.txt,.csv,.md,.vcf";

/** Files per assistant message (each read like smart capture). Mirrors the API's limit. */
export const MAX_ATTACHMENTS = 3;

/** Voice messages for the assistant. Mirrors the API's limit. */
export const MAX_RECORDING_BYTES = 10 * 1024 * 1024;

/** CSV imports (contacts, companies). Mirrors the API's limit. */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

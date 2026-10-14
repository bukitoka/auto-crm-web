export type WebhookSubscription = {
  id: string;
  event: string;
  target_url: string;
  is_active: boolean;
  /** HMAC signing secret. The UI only displays it right after creation. */
  secret?: string | null;
  created_at: string;
  updated_at: string;
};

export type WebhookPayload = {
  event: string;
  target_url: string;
  is_active: boolean;
};

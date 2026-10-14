import { z } from "zod";

export const webhookFormSchema = z.object({
  event: z.string().min(1, "Pick an event"),
  // http(s) only, like the API's `AnyHttpUrl` (plain z.url() also accepts "localhost:5678").
  target_url: z.url({
    protocol: /^https?$/,
    error: "Enter a full URL, e.g. http://localhost:5678/webhook/…",
  }),
  is_active: z.boolean(),
});
export type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export const emptyWebhookForm: WebhookFormValues = {
  event: "",
  target_url: "",
  is_active: true,
};

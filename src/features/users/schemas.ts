import { z } from "zod";

export const adminCreateSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(128),
});
export type AdminCreateValues = z.infer<typeof adminCreateSchema>;

export const adminEditSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(200),
  email: z.email("Enter a valid email"),
  /** Blank keeps the current password. */
  password: z
    .string()
    .max(128)
    .refine((value) => value === "" || value.length >= 8, "At least 8 characters"),
});
export type AdminEditValues = z.infer<typeof adminEditSchema>;

export const emptyAdminForm: AdminCreateValues = { full_name: "", email: "", password: "" };

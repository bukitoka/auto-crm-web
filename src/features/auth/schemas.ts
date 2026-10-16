import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const setupSchema = z
  .object({
    full_name: z.string().trim().min(1, "Name is required").max(200),
    email: z.email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters").max(128),
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type SetupValues = z.infer<typeof setupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters").max(128),
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

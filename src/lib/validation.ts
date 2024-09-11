import { z } from "zod";

const requiredString = z.string().trim().min(1, { message: "Required" });

export const signUpSchema = z.object({
  email: requiredString.email({ message: "Email is invalid" }),
  username: requiredString.regex(/^[a-zA-Z0-9_-]+$/, {
    message: "Username must be alphanumeric and can include - and _",
  }),
  password: requiredString.min(8, {
    message: "Password must be at least 8 characters",
  }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: requiredString.email({ message: "Email is invalid" }),
  password: requiredString,
});

export type SignInSchema = z.infer<typeof signInSchema>;

export const resetPasswordSchema = z
  .object({
    password: requiredString.min(8, {
      message: "Password must be at least 8 characters",
    }),
    newPassword: requiredString.min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: requiredString.min(8, {
      message: "Password must be at least 8 characters",
    }),
    logoutFromAllDevices: z.boolean().optional(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

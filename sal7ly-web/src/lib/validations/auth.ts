import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  role: z.enum(["user", "craftsman"], { message: "Please select a role" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(
      ["admin", "rider", "driver"],
      "Role must be one of admin, rider, driver"
    ),
    vehicleInfo: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Valid email is required")
      .transform((val) => val.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  }),
});

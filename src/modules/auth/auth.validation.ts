import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      role: z.enum(["admin", "rider", "driver"], {
        message: "Role must be one of admin, rider, driver",
      }),
      vehicleInfo: z.string().optional(),
      currentLocation: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.role === "driver") return !!data.vehicleInfo;
        if (data.role === "rider") return !!data.currentLocation;
        return true;
      },
      {
        message:
          "Drivers must provide vehicleInfo; Riders must provide current location",
        path: ["vehicleInfo"],
      }
    ),
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

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name cannot be empty").optional(),
    email: z.string().email("Valid email required").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .optional(),
    vehicleInfo: z.string().optional(),
    currentLocation: z.string().optional(),
  }),
});

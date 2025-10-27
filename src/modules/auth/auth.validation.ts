import { z } from "zod";

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Valid email is required"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phoneNumber: z.string().optional(),
      role: z.enum(["admin", "rider", "driver"], {
        message: "Role must be one of admin, rider, driver",
      }),
      vehicleInfo: z.string().optional(),
      currentLocation: z.string().optional(),
    })
    .refine(
      (data) => {
        if (data.role === "driver")
          return !!data.vehicleInfo && !!data.currentLocation;
        if (data.role === "rider") return !!data.currentLocation;
        return true;
      },
      {
        message:
          "Drivers must provide vehicleInfo and currentLocation; Riders must provide currentLocation",
        path: ["vehicleInfo"],
      }
    ),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const requestResetSchema = z.object({
  body: z.object({
    email: z.string().email("Valid email is required"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

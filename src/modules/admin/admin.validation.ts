import { z } from "zod";

export const approveDriverSchema = z.object({
  body: z.object({
    approvalStatus: z.enum(["pending", "approved", "rejected"], {
      message: "Invalid approval status",
    }),
  }),
});

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "blocked", "suspended"], {
      message: "Invalid user status",
    }),
  }),
});

import { z } from "zod";

export const requestRideSchema = z.object({
  body: z.object({
    pickup: z.object({
      address: z.string().min(1, "Pickup address required"),
      lat: z.number(),
      lng: z.number(),
    }),
    destination: z.object({
      address: z.string().min(1, "Destination address required"),
      lat: z.number(),
      lng: z.number(),
    }),
  }),
});

export const updateRideStatusSchema = z.object({
  body: z.object({
    status: z.enum(["picked_up", "in_transit", "completed"], "Invalid status"),
  }),
});

export const rateDriverSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
  }),
});

export const riderFeedbackSchema = z.object({
  body: z.object({
    feedback: z.string().min(1, "Feedback cannot be empty"),
  }),
});


export const nearbyDriversSchema = z.object({
  body: z.object({
    loc: z.string().min(1, "Location is required"), // address string
    maxDistance: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val) : 5000)), // optional, default 5000
  }),
});

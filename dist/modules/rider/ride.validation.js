"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyDriversSchema = exports.riderFeedbackSchema = exports.rateDriverSchema = exports.updateRideStatusSchema = exports.requestRideSchema = void 0;
const zod_1 = require("zod");
exports.requestRideSchema = zod_1.z.object({
    body: zod_1.z.object({
        pickup: zod_1.z.object({
            address: zod_1.z.string().min(1, "Pickup address required"),
            lat: zod_1.z.number(),
            lng: zod_1.z.number(),
        }),
        destination: zod_1.z.object({
            address: zod_1.z.string().min(1, "Destination address required"),
            lat: zod_1.z.number(),
            lng: zod_1.z.number(),
        }),
    }),
});
exports.updateRideStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(["picked_up", "in_transit", "completed"], "Invalid status"),
    }),
});
exports.rateDriverSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number().min(1).max(5),
    }),
});
exports.riderFeedbackSchema = zod_1.z.object({
    body: zod_1.z.object({
        feedback: zod_1.z.string().min(1, "Feedback cannot be empty"),
    }),
});
exports.nearbyDriversSchema = zod_1.z.object({
    query: zod_1.z.object({
        lat: zod_1.z.string(),
        lng: zod_1.z.string(),
        maxDistance: zod_1.z.string().optional(),
    }),
});

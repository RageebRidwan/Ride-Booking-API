"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilitySchema = void 0;
const zod_1 = require("zod");
exports.availabilitySchema = zod_1.z.object({
    body: zod_1.z.object({
        isOnline: zod_1.z.boolean(),
    }),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ride = void 0;
// src/modules/ride/ride.model.ts
const mongoose_1 = require("mongoose");
const rideSchema = new mongoose_1.Schema({
    riderId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    pickup: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    destination: {
        address: { type: String, required: true },
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    status: {
        type: String,
        enum: [
            "requested",
            "accepted",
            "picked_up",
            "in_transit",
            "completed",
            "cancelled",
        ],
        default: "requested",
    },
    fare: { type: Number, default: 0 },
    driverRating: { type: Number, min: 1, max: 5 },
    riderFeedback: { type: String },
    timestamps: {
        requestedAt: { type: Date, default: Date.now },
        acceptedAt: Date,
        pickedUpAt: Date,
        inTransitAt: Date,
        completedAt: Date,
        cancelledAt: Date,
    },
}, { timestamps: true });
exports.Ride = (0, mongoose_1.model)("Ride", rideSchema);

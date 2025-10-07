// src/modules/ride/ride.model.ts
import { Schema, model, Document } from "mongoose";
import { IUser } from "../user/user.model";

export type RideStatus =
  | "requested"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "completed"
  | "cancelled";

export interface IRide extends Document {
  riderId: IUser["_id"];
  driverId?: IUser["_id"];
  pickup: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  status: RideStatus;
  fare: number;
  timestamps: {
    requestedAt: Date;
    acceptedAt?: Date;
    pickedUpAt?: Date;
    inTransitAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
  };
  riderFeedback?: string;
  driverRating?: number;
}

const rideSchema = new Schema<IRide>(
  {
    riderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: Schema.Types.ObjectId, ref: "User" },
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
  },
  { timestamps: true }
);

export const Ride = model<IRide>("Ride", rideSchema);

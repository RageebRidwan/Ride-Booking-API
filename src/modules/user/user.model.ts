import { Schema, model, Document } from "mongoose";
import bcrypt from "bcryptjs";

type Role = "admin" | "rider" | "driver";
type UserStatus = "active" | "blocked" | "suspended";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role: Role;
  status: UserStatus;
  currentLocation?: string;
  vehicleInfo?: string;
  isOnline?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  comparePassword(candidatePassword: string): Promise<boolean>;
  ratings?: number[];
  averageRating?: number;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  cancelAttempts: number;
  lastCancelAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    role: {
      type: String,
      enum: ["admin", "rider", "driver"],
      default: "rider",
    },
    status: {
      type: String,
      enum: ["active", "blocked", "suspended"],
      default: "active",
    },
    currentLocation: { type: String },
    vehicleInfo: { type: String },
    isOnline: { type: Boolean, default: true },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    ratings: { type: [Number], default: [] },
    averageRating: { type: Number, default: 0 },
    cancelAttempts: { type: Number, default: 0 },
    lastCancelAt: { type: Date, default: null },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(Number(process.env.BCRYPT_SALT || 10));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>("User", userSchema);

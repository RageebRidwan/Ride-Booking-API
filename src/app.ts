
import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";


import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import rideRoutes from "./modules/ride/ride.routes";
import driverRoutes from "./modules/driver/driver.routes";
import adminRoutes from "./modules/admin/admin.routes";


import { errorHandler, notFound } from "./middlewares/error.middleware";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "🚗 Ride Booking API is running!",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

export default app;

import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/auth.routes";
import rideRoutes from "./modules/rider/ride.routes";
import driverRoutes from "./modules/driver/driver.routes";
import adminRoutes from "./modules/user/admin.routes";
import { errorHandler } from "./middlewares/error.middleware";
dotenv.config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Ride Booking API is running!" });
});
app.use('/api/auth', authRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use(errorHandler);
export default app;

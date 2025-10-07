// src/modules/driver/driver.routes.ts
import { Router } from "express";
import { setAvailability } from "./driver.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import {
  acceptRide,
  updateRideStatus,
  getEarnings,
} from "../rider/ride.controller";
import { availabilitySchema } from "./driver.validation";
import { validate } from "../../middlewares/validate.middleware";
import { updateRideStatusSchema } from "../rider/ride.validation";

const router = Router();

router.patch(
  "/availability",
  protect,
  authorize("driver"),
  validate(availabilitySchema),
  setAvailability
);

// Ride actions
router.patch("/rides/:id/accept", protect, authorize("driver"), acceptRide);
router.patch(
  "/rides/:id/status",
  protect,
  authorize("driver"),
  validate(updateRideStatusSchema),
  updateRideStatus
);
router.get("/rides/earnings", protect, authorize("driver"), getEarnings);

export default router;

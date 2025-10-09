// src/modules/ride/ride.routes.ts
import { Router } from "express";
import {
  requestRide,
  cancelRide,
  getRideHistory,
  rateDriver,
  leaveFeedback,
  findNearbyDrivers,
} from "./ride.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  nearbyDriversSchema,
  rateDriverSchema,
  requestRideSchema,
  riderFeedbackSchema,
} from "./ride.validation";

const router = Router();

router.post(
  "/request",
  protect,
  authorize("rider"),
  validate(requestRideSchema),
  requestRide
);
router.patch("/:id/cancel", protect, authorize("rider"), cancelRide);
router.get("/me", protect, authorize("rider"), getRideHistory);
router.patch(
  "/:rideId/rate-driver",
  protect,
  authorize("rider"),
  validate(rateDriverSchema),
  rateDriver
);
router.patch(
  "/:rideId/feedback",
  protect,
  authorize("rider"),
  validate(riderFeedbackSchema),
  leaveFeedback
);
router.post(
  "/drivers/nearby",
  protect,
  authorize("rider"),
  validate(nearbyDriversSchema),
  findNearbyDrivers
);
export default router;

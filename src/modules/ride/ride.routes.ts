// src/modules/ride/ride.routes.ts
import { Router } from "express";
import RideController from "./ride.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  requestRideSchema,
  rateDriverSchema,
  riderFeedbackSchema,
  nearbyDriversSchema,
  cancelRideSchema,
} from "./ride.validation";

const router = Router();

// All routes require authentication
router.use(protect);

// Rider-only routes
router.post(
  "/request",
  authorize("rider"),
  validate(requestRideSchema),
  RideController.requestRide.bind(RideController)
);

router.get(
  "/history",
  authorize("rider"),
  RideController.getRiderHistory.bind(RideController)
);

router.patch(
  "/:id/cancel",
  authorize("rider"),
  validate(cancelRideSchema),
  RideController.cancelRide.bind(RideController)
);

router.patch(
  "/:id/rate-driver",
  authorize("rider"),
  validate(rateDriverSchema),
  RideController.rateDriver.bind(RideController)
);

router.patch(
  "/:id/feedback",
  authorize("rider"),
  validate(riderFeedbackSchema),
  RideController.leaveFeedback.bind(RideController)
);

router.post(
  "/drivers/nearby",
  authorize("rider"),
  validate(nearbyDriversSchema),
  RideController.findNearbyDrivers.bind(RideController)
);

// Accessible by rider, driver, and admin
router.get("/:id", RideController.getRideById.bind(RideController));

export default router;

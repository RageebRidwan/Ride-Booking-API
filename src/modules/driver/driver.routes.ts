import { Router } from "express";
import DriverController from "./driver.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { availabilitySchema } from "./driver.validation";
import { updateRideStatusSchema } from "../ride/ride.validation";

const router = Router();

router.use(protect, authorize("driver"));

// PATCH /api/drivers/availability
router.patch(
  "/availability",
  validate(availabilitySchema),
  DriverController.setAvailability.bind(DriverController)
);

// GET /api/drivers/rides/pending
router.get(
  "/rides/pending",
  DriverController.getPendingRides.bind(DriverController)
);

// GET /api/drivers/rides/history
router.get(
  "/rides/history",
  DriverController.getDriverHistory.bind(DriverController)
);

// GET /api/drivers/rides/earnings
router.get(
  "/rides/earnings",
  DriverController.getEarnings.bind(DriverController)
);

// PATCH /api/drivers/rides/:id/accept
router.patch(
  "/rides/:id/accept",
  DriverController.acceptRide.bind(DriverController)
);

// PATCH /api/drivers/rides/:id/status
router.patch(
  "/rides/:id/status",
  validate(updateRideStatusSchema),
  DriverController.updateRideStatus.bind(DriverController)
);
router.post(
  "/rides/:id/cancel",
  DriverController.cancelRide.bind(DriverController)
);

export default router;

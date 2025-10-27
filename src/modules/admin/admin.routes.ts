import { Router } from "express";
import AdminController from "./admin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  approveDriverSchema,
  updateUserStatusSchema,
} from "./admin.validation";

const router = Router();

// All routes require authentication and admin role
router.use(protect, authorize("admin"));

// User management
router.get("/users", AdminController.getAllUsers.bind(AdminController));

router.patch(
  "/drivers/approve/:id",
  validate(approveDriverSchema),
  AdminController.approveDriver.bind(AdminController)
);

router.patch(
  "/users/block/:id",
  validate(updateUserStatusSchema),
  AdminController.updateUserStatus.bind(AdminController)
);

// Ride management
router.get("/rides", AdminController.getAllRides.bind(AdminController));

// Statistics
router.get("/users/stats", AdminController.getUserStats.bind(AdminController));
router.get("/rides/stats", AdminController.getRideStats.bind(AdminController));
router.get(
  "/drivers/ratings",
  AdminController.getDriverRatings.bind(AdminController)
);

export default router;

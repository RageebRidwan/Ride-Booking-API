// src/modules/user/admin.routes.ts
import { Router } from "express";
import {
  getAllUsers,
  approveDriver,
  blockUser,
  getAllRides,
  getUserStats,
  getUserStatusStats,
  getDriverRatings,
  getRideStats,
} from "./admin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.get("/users/stats", getUserStats);
router.get("/users/status-stats", getUserStatusStats);
router.get("/drivers/ratings", getDriverRatings);
router.get("/rides/stats", getRideStats);
router.patch("/drivers/approve/:id", approveDriver);
router.patch("/users/block/:id", blockUser);
router.get("/rides", getAllRides);

export default router;

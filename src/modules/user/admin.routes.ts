// src/modules/user/admin.routes.ts
import { Router } from "express";
import {
  getAllUsers,
  approveDriver,
  blockUser,
  getAllRides,
} from "./admin.controller";
import { protect, authorize } from "../../middlewares/auth.middleware";

const router = Router();

router.use(protect, authorize("admin"));

router.get("/users", getAllUsers);
router.patch("/drivers/approve/:id", approveDriver);
router.patch("/users/block/:id", blockUser);
router.get("/rides", getAllRides);

export default router;

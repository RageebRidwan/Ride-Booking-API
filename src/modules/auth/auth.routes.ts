// src/modules/auth/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  logout,
  resetPassword,
  requestPasswordReset,
  updateProfile,
} from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.validation";
import { protect } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", protect, logout);
router.post("/reset-password", protect, requestPasswordReset);
router.post("/reset-password/:token", protect, resetPassword);
router.patch("/update", protect, validate(updateProfileSchema), updateProfile);

export default router;

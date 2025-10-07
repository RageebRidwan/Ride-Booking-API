// src/modules/auth/auth.routes.ts
import { Router } from "express";
import {
  register,
  login,
  logout,
  resetPassword,
  requestPasswordReset,
} from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/reset-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

export default router;

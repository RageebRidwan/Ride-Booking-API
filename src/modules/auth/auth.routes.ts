import { Router } from "express";
import AuthController from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";
import { protect } from "../../middlewares/auth.middleware";
import {
  registerSchema,
  loginSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "./auth.validation";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  AuthController.register.bind(AuthController)
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  AuthController.login.bind(AuthController)
);

// POST /api/auth/logout
router.post("/logout", protect, AuthController.logout.bind(AuthController));

// POST /api/auth/request-reset
router.post(
  "/request-reset",
  validate(requestResetSchema),
  AuthController.requestPasswordReset.bind(AuthController)
);

// POST /api/auth/reset-password/:token
router.post(
  "/reset-password/:token",
  validate(resetPasswordSchema),
  AuthController.resetPassword.bind(AuthController)
);

export default router;

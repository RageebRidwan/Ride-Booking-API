import { Router } from "express";
import UserController from "./user.controller";
import { protect } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { changePasswordSchema, updateProfileSchema } from "./user.validation";

const router = Router();

router.use(protect);

// GET /api/users/profile
router.get("/profile", UserController.getProfile.bind(UserController));

// PATCH /api/users/profile
router.patch(
  "/profile",
  validate(updateProfileSchema),
  UserController.updateProfile.bind(UserController)
);

// POST /api/users/change-password
router.post(
  "/change-password",
  validate(changePasswordSchema),
  UserController.changePassword.bind(UserController)
);

export default router;

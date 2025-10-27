// src/modules/user/user.controller.ts
import { Request, Response, NextFunction } from "express";
import UserService from "./user.service";
import ApiResponse from "../../utils/ApiResponse";

class UserController {
  // GET /users/profile - Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.user!.id);
      ApiResponse.success(res, 200, "Profile retrieved successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /users/profile - Update profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateProfile(req.user!.id, req.body);
      ApiResponse.success(res, 200, "Profile updated successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  // POST /users/change-password - Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const result = await UserService.changePassword(
        req.user!.id,
        oldPassword,
        newPassword
      );
      ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();

import { Request, Response, NextFunction } from "express";
import AuthService from "./auth.service";
import ApiResponse from "../../utils/ApiResponse";

class AuthController {
  // POST /auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      ApiResponse.success(res, 201, "Registration successful", result);
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      // Set HTTP-only cookie
      res.cookie("auth_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      ApiResponse.success(res, 200, "Login successful", result);
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      ApiResponse.success(res, 200, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/request-reset
  async requestPasswordReset(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.requestPasswordReset(email);
      ApiResponse.success(res, 200, result.message, {
        token: result.resetToken,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/reset-password/:token
  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await AuthService.resetPassword(token, password);
      ApiResponse.success(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

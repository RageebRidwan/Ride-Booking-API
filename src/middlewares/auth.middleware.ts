// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError";
import { User } from "../modules/user/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Not authorized, no token provided");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };

    // Check if user still exists and is active
    const user: any = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new ApiError(401, "User no longer exists");
    }

    if (user.status === "blocked") {
      throw new ApiError(403, "Your account has been blocked");
    }

    if (user.status === "suspended") {
      throw new ApiError(403, "Your account has been suspended");
    }

    // Attach user to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err: any) {
    if (err instanceof ApiError) {
      next(err);
    } else {
      next(new ApiError(401, "Token invalid or expired"));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You do not have permission to perform this action")
      );
    }
    next();
  };
};

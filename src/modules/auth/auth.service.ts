// src/modules/auth/auth.service.ts
import jwt, { SignOptions } from "jsonwebtoken";
import { IUser, User } from "../user/user.model";
import ApiError from "../../utils/ApiError";
import { getCoordinatesFromAddress } from "../../utils/geoCode";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const RESET_EXPIRES_IN = process.env.RESET_EXPIRES_IN || "1h";

class AuthService {
  // Generate JWT token
  private generateToken(userId: string, role: string): string {
    const secret: jwt.Secret = JWT_SECRET;
    const payload = { id: userId, role };
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };

    return jwt.sign(payload, secret, options);
  }

  // Register new user
  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "rider" | "driver";
    vehicleInfo?: string;
    currentLocation?: string;
    phoneNumber?: string;
  }) {
    const {
      name,
      email,
      password,
      role,
      vehicleInfo,
      currentLocation,
      phoneNumber,
    } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ApiError(400, "Email already in use");
    }

    // Validate role-specific requirements
    if ((role === "rider" || role === "driver") && !currentLocation) {
      throw new ApiError(400, "Current location is required");
    }

    if (role === "driver" && !vehicleInfo) {
      throw new ApiError(400, "Drivers must provide vehicle information");
    }

    // Create user data object
    const newUserData: any = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      phoneNumber,
    };

    // Geocode location if provided
    if (currentLocation) {
      const location = await getCoordinatesFromAddress(currentLocation);
      newUserData.currentLocation = currentLocation;
      newUserData.location = location;
    }

    // Add driver-specific fields
    if (role === "driver") {
      newUserData.vehicleInfo = vehicleInfo;
      newUserData.approvalStatus = "pending";
    }

    // Create user
    const user: any = new User(newUserData);
    await user.save();

    // Generate token
    const token = this.generateToken(user._id.toString(), user.role);

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return { token, user: userObject };
  }

  // Login user
  async login(email: string, password: string) {
    // Find user
    const user: any = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check account status
    if (user.status === "blocked") {
      throw new ApiError(403, "Your account has been blocked");
    }

    if (user.status === "suspended") {
      throw new ApiError(403, "Your account has been suspended");
    }

    // Generate token
    const token = this.generateToken(user._id.toString(), user.role);

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return { token, user: userObject };
  }

  // Request password reset
  async requestPasswordReset(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET as jwt.Secret, {
      expiresIn: RESET_EXPIRES_IN,
    } as SignOptions);

    // In production, we can send email with reset link
    // For now, returning token in response
    return { resetToken, message: "Password reset token generated" };
  }

  // Reset password
  async resetPassword(token: string, newPassword: string) {
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return { message: "Password reset successful" };
    } catch (error: any) {
      if (
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError"
      ) {
        throw new ApiError(400, "Invalid or expired reset token");
      }
      throw error;
    }
  }
}

export default new AuthService();

import { IUser, User } from "./user.model";
import ApiError from "../../utils/ApiError";
import { getCoordinatesFromAddress } from "../../utils/geoCode";

class UserService {
  // Get current user profile
  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updateData: {
      name?: string;
      email?: string;
      password?: string;
      vehicleInfo?: string;
      currentLocation?: string;
      phoneNumber?: string;
    }
  ) {
    const user: any = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({
        email: updateData.email.toLowerCase(),
      });
      if (existingUser) {
        throw new ApiError(400, "Email already in use");
      }
      user.email = updateData.email.toLowerCase();
    }

    // Update basic fields
    if (updateData.name) user.name = updateData.name;
    if (updateData.phoneNumber) user.phoneNumber = updateData.phoneNumber;

    // Update role-specific fields
    if (user.role === "driver" && updateData.vehicleInfo) {
      user.vehicleInfo = updateData.vehicleInfo;
    }

    // Update location and geocode
    if (
      updateData.currentLocation &&
      updateData.currentLocation.trim() !== ""
    ) {
      user.currentLocation = updateData.currentLocation;
      const location = await getCoordinatesFromAddress(
        updateData.currentLocation
      );
      user.location = location;
    }

    // Update password (will be hashed by pre-save hook)
    if (updateData.password) {
      user.password = updateData.password;
    }

    await user.save();

    // Return user without password
    const updatedUser: Partial<IUser> = user.toObject();
    delete updatedUser.password;

    return updatedUser;
  }

  // Change password (separate endpoint for security)
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Verify old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }
}

export default new UserService();

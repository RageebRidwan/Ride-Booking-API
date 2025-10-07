// src/modules/user/admin.controller.ts
import { Request, Response } from "express";
import { User } from "./user.model";
import { Ride } from "../rider/ride.model";

// View all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Approve/suspend driver
export const approveDriver = async (req: Request, res: Response) => {
  try {
    const driver = await User.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    if (driver.role !== "driver")
      return res.status(400).json({ message: "User is not a driver" });

    const { approvalStatus } = req.body; // 'approved' | 'rejected' | 'pending'
    driver.approvalStatus = approvalStatus;
    await driver.save();

    res.status(200).json({ message: `Driver ${approvalStatus}`, driver });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Block/unblock user
export const blockUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { status } = req.body; // 'active' | 'blocked' | 'suspended'
    user.status = status;
    await user.save();

    res.status(200).json({ message: `User ${status}`, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// View all rides
export const getAllRides = async (req: Request, res: Response) => {
  try {
    const rides = await Ride.find()
      .populate("riderId", "name email")
      .populate("driverId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ rides });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

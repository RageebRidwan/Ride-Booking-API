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

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalRiders = await User.countDocuments({ role: "rider" });
    const totalDrivers = await User.countDocuments({ role: "driver" });

    res.status(200).json({
      totalUsers,
      totalAdmins,
      totalRiders,
      totalDrivers,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const getUserStatusStats = async (req: Request, res: Response) => {
  try {
    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    res.status(200).json({ activeUsers, blockedUsers, suspendedUsers });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};


export const getRideStats = async (req: Request, res: Response) => {
  try {
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: "completed" });
    const cancelledRides = await Ride.countDocuments({ status: "cancelled" });
    const inProgressRides = await Ride.countDocuments({
      status: { $in: ["accepted", "picked_up", "in_transit"] },
    });

    res.status(200).json({
      totalRides,
      completedRides,
      cancelledRides,
      inProgressRides,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};


export const getDriverRatings = async (req: Request, res: Response) => {
  try {
    const drivers = await User.find({ role: "driver" });

    const ratings = drivers.map((d) => d.averageRating || 0);
    const totalDrivers = ratings.length;
    const avgRating =
      totalDrivers > 0 ? ratings.reduce((a, b) => a + b, 0) / totalDrivers : 0;

    res.status(200).json({ totalDrivers, avgRating });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

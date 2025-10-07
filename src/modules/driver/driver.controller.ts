// src/modules/driver/driver.controller.ts
import { AuthRequest } from "../../middlewares/auth.middleware";
import { Ride } from "../rider/ride.model";
import { User } from "../user/user.model";
import { Request, Response } from "express";
// Set online/offline
export const setAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { isOnline } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Driver not found" });

    if (user.role !== "driver")
      return res
        .status(403)
        .json({ message: "Only drivers can set availability" });
    user.isOnline = isOnline;
    await user.save();

    res.status(200).json({
      message: `Driver is now ${isOnline ? "online" : "offline"}`,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// src/modules/driver/driver.controller.ts
export const getDriverRating = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await Ride.find({
      driverId: req.params.id,
      driverRating: { $exists: true },
    });

    if (!rides.length)
      return res.status(200).json({ averageRating: 0, totalRatings: 0 });

    const total = rides.reduce(
      (sum, ride) => sum + (Number(ride.driverRating) ?? 0),
      0
    );
    const averageRating = (total / rides.length).toFixed(2);

    res.status(200).json({ averageRating, totalRatings: rides.length });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};
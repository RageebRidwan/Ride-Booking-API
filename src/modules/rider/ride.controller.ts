// src/modules/ride/ride.controller.ts
import { Request, Response } from "express";
import { Ride } from "./ride.model";
import { AuthRequest } from "../../middlewares/auth.middleware";
import haversine from "haversine-distance";
import { User } from "../user/user.model";
import { getCoordinatesFromAddress } from "../../utils/geoCode";
// Request a ride
export const requestRide = async (req: AuthRequest, res: Response) => {
  try {
    const { pickup, destination } = req.body;
    if (!pickup || !destination)
      return res
        .status(400)
        .json({ message: "Pickup and destination required" });

    // Check active ride
    const activeRide = await Ride.findOne({
      riderId: req.user.id,
      status: { $in: ["requested", "accepted", "picked_up", "in_transit"] },
    });
    if (activeRide)
      return res
        .status(400)
        .json({ message: "You already have an active ride" });

    // Distance in km
    const distance =
      haversine(
        { lat: pickup.lat, lng: pickup.lng },
        { lat: destination.lat, lng: destination.lng }
      ) / 1000;

    const baseFare = 50; // fixed starting fare
    const perKm = 20; // per km charge
    const fare = baseFare + distance * perKm;
    const ride = new Ride({ riderId: req.user.id, pickup, destination, fare });
    await ride.save();
    res.status(201).json({ message: "Ride requested", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Cancel a ride
export const cancelRide = async (req: AuthRequest, res: Response) => {
  try {
    const ride: any = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (ride.riderId.toString() !== req.user.id)
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this ride" });
    if (ride.status !== "requested")
      return res
        .status(400)
        .json({ message: "Cannot cancel after driver accepted" });

    const rider = await User.findById(req.user.id);
    if (!rider) return res.status(404).json({ message: "Rider not found" });

    const now = new Date();
    const DAY = 24 * 60 * 60 * 1000;

    // Reset cancelAttempts if last cancel was more than 24h ago
    if (
      rider.lastCancelAt &&
      now.getTime() - rider.lastCancelAt.getTime() > DAY
    ) {
      rider.cancelAttempts = 0;
    }

    if (rider.cancelAttempts >= 3) {
      return res
        .status(403)
        .json({ message: "Cancel limit reached. Try again later." });
    }

    ride.status = "cancelled";
    ride.timestamps.cancelledAt = new Date();
    await ride.save();
    // Update rider cancel attempts
    rider.cancelAttempts = (rider.cancelAttempts || 0) + 1;
    rider.lastCancelAt = now;
    await rider.save();
    res.status(200).json({ message: "Ride cancelled", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get rider ride history
export const getRideHistory = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await Ride.find({ riderId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ rides });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Accept a ride
export const acceptRide = async (req: AuthRequest, res: Response) => {
  try {
    const driver = await User.findById(req.user.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // 1️⃣ Check if driver is approved
    if (driver.approvalStatus !== "approved") {
      return res.status(403).json({ message: "Driver not approved yet" });
    }

    // 2️⃣ Check if driver is online
    if (!driver.isOnline) {
      return res.status(403).json({ message: "Driver is currently offline" });
    }

    // 3️⃣ Check if driver already has an active ride
    const activeRide = await Ride.findOne({
      driverId: driver.id,
      status: { $in: ["accepted", "picked_up", "in_transit"] },
    });
    if (activeRide) {
      return res
        .status(403)
        .json({ message: "Driver is already on an active ride" });
    }
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.status !== "requested")
      return res.status(400).json({ message: "Ride cannot be accepted" });

    ride.driverId = req.user.id;
    ride.status = "accepted";
    ride.timestamps.acceptedAt = new Date();
    await ride.save();

    res.status(200).json({ message: "Ride accepted", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Update ride status (picked_up → in_transit → completed)
export const updateRideStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.driverId?.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    const allowedStatuses: string[] = ["picked_up", "in_transit", "completed"];
    if (!allowedStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status update" });

    ride.status = status as any;
    const timestampField = {
      picked_up: "pickedUpAt",
      in_transit: "inTransitAt",
      completed: "completedAt",
    }[String(status)];

    (ride.timestamps as any)[String(timestampField)] = new Date();
    await ride.save();

    res.status(200).json({ message: `Ride status updated to ${status}`, ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// Get driver earnings (sum of completed rides)
export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const rides = await Ride.find({
      driverId: req.user.id,
      status: "completed",
    });
    const earnings = Number(
      rides.reduce((total, ride) => total + (ride.fare || 0), 0).toFixed(2)
    );

    res.status(200).json({ earnings, rides });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// src/modules/ride/ride.controller.ts
export const rateDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId } = req.params;
    const { rating } = req.body;

    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1-5" });

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });
    if (String(ride.riderId) !== req.user.id)
      return res.status(403).json({ message: "Not your ride" });
    if (ride.status !== "completed")
      return res.status(400).json({ message: "Can only rate completed rides" });

    const driver = await User.findById(ride.driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // Update ride
    ride.driverRating = rating;
    await ride.save();

    // Update driver
    driver.ratings = driver.ratings ? [...driver.ratings, rating] : [rating];
    driver.averageRating =
      driver.ratings.reduce((sum: any, r: any) => sum + r, 0) /
      driver.ratings.length;

    await driver.save();

    res.status(200).json({ message: "Driver rated", ride, driver });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// src/modules/ride/ride.controller.ts
export const leaveFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { rideId } = req.params;
    const { feedback } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (String(ride.riderId) !== req.user.id)
      return res.status(403).json({ message: "Not your ride" });

    if (ride.status !== "completed")
      return res
        .status(400)
        .json({ message: "Can only leave feedback for completed rides" });

    ride.riderFeedback = feedback;
    await ride.save();

    res.status(200).json({ message: "Feedback submitted", ride });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const findNearbyDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { loc, maxDistance = 5000 } = req.body; // loc = address

    if (!loc) return res.status(400).json({ message: "Location is required" });

    // Convert address to GeoJSON coordinates
    const lonLat = await getCoordinatesFromAddress(loc);

    const drivers = await User.find({
      role: "driver",
      isOnline: true,
      approvalStatus: "approved",
      status: "active",
      location: {
        $near: {
          $geometry: lonLat, // { type: 'Point', coordinates: [lng, lat] }
          $maxDistance: parseInt(maxDistance as any), // meters
        },
      },
    }).select("name vehicleInfo location");

    res.status(200).json({ drivers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};

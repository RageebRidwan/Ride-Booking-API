// src/modules/ride/ride.service.ts
import { Ride } from "./ride.model";
import { User } from "../user/user.model";
import ApiError from "../../utils/ApiError";
import QueryBuilder from "../../utils/queryBuilder";
import {
  FARE_CONFIG,
  CANCEL_LIMITS,
  RIDE_STATUS,
} from "../../config/constants";
import { Query } from "mongoose";

// Haversine formula to calculate distance
function haversine(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const toRad = (val: number) => (val * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

class RideService {
  // Request a new ride
  async requestRide(
    riderId: string,
    pickup: { address: string; lat: number; lng: number },
    destination: { address: string; lat: number; lng: number }
  ) {
    // Check for active rides
    const activeRide = await Ride.findOne({
      riderId,
      status: {
        $in: [
          RIDE_STATUS.REQUESTED,
          RIDE_STATUS.ACCEPTED,
          RIDE_STATUS.PICKED_UP,
          RIDE_STATUS.IN_TRANSIT,
        ],
      },
    });

    if (activeRide) {
      throw new ApiError(400, "You already have an active ride");
    }

    // Calculate distance and fare
    const distanceMeters = haversine(
      { lat: pickup.lat, lng: pickup.lng },
      { lat: destination.lat, lng: destination.lng }
    );
    const distanceKm = distanceMeters / 1000;
    const fare = FARE_CONFIG.BASE_FARE + distanceKm * FARE_CONFIG.PER_KM_RATE;

    const ride = new Ride({
      riderId,
      pickup,
      destination,
      fare: Math.round(fare * 100) / 100, // Round to 2 decimals
    });

    await ride.save();
    return ride;
  }

  // Get ride history for rider (with pagination & filters)
  async getRiderHistory(
    riderId: string,
    queryParams: {
      page?: string;
      limit?: string;
      status?: string;
      fareMin?: string;
      fareMax?: string;
      dateFrom?: string;
      dateTo?: string;
      sort?: string;
    }
  ) {
    const query = Ride.find({ riderId }).populate(
      "driverId",
      "name email vehicleInfo averageRating"
    );

    // Apply filters
    const filters: any = {};

    if (queryParams.status) {
      filters.status = queryParams.status;
    }

    if (queryParams.fareMin || queryParams.fareMax) {
      filters.fare = {};
      if (queryParams.fareMin)
        filters.fare.$gte = parseFloat(queryParams.fareMin);
      if (queryParams.fareMax)
        filters.fare.$lte = parseFloat(queryParams.fareMax);
    }

    if (queryParams.dateFrom || queryParams.dateTo) {
      filters.createdAt = {};
      if (queryParams.dateFrom)
        filters.createdAt.$gte = new Date(queryParams.dateFrom);
      if (queryParams.dateTo)
        filters.createdAt.$lte = new Date(queryParams.dateTo);
    }

    const queryBuilder = new QueryBuilder(query.find(filters), queryParams)
      .sort()
      .paginate();

    const rides = await queryBuilder.query;
    const countQuery: any = Ride.find({ riderId, ...filters });
    const pagination = await queryBuilder.getPaginationInfo(countQuery);

    return { rides, pagination };
  }

  // Get single ride details
  async getRideById(rideId: string, userId: string, userRole: string) {
    const ride: any = await Ride.findById(rideId)
      .populate("riderId", "name email phoneNumber")
      .populate("driverId", "name email phoneNumber vehicleInfo averageRating");

    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    // Check authorization
    const isRider = ride.riderId._id.toString() === userId;
    const isDriver = ride.driverId && ride.driverId._id.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isRider && !isDriver && !isAdmin) {
      throw new ApiError(403, "You are not authorized to view this ride");
    }

    return ride;
  }

  // Cancel ride
  async cancelRide(rideId: string, riderId: string, reason?: string) {
    const ride: any = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.riderId.toString() !== riderId) {
      throw new ApiError(403, "Not authorized to cancel this ride");
    }

    if (ride.status !== RIDE_STATUS.REQUESTED) {
      throw new ApiError(400, "Cannot cancel after driver accepted");
    }

    const rider = await User.findById(riderId);
    if (!rider) {
      throw new ApiError(404, "Rider not found");
    }

    // Check cancel limits
    const now = new Date();
    const resetWindow = CANCEL_LIMITS.RESET_WINDOW_HOURS * 60 * 60 * 1000;

    if (
      rider.lastCancelAt &&
      now.getTime() - rider.lastCancelAt.getTime() > resetWindow
    ) {
      rider.cancelAttempts = 0;
    }

    if (rider.cancelAttempts >= CANCEL_LIMITS.MAX_ATTEMPTS) {
      throw new ApiError(403, "Cancel limit reached. Try again later.");
    }

    // Update ride status
    ride.status = RIDE_STATUS.CANCELLED;
    ride.timestamps.cancelledAt = new Date();
    if (reason) ride.cancellationReason = reason;
    await ride.save();

    // Update rider cancel attempts
    rider.cancelAttempts = (rider.cancelAttempts || 0) + 1;
    rider.lastCancelAt = now;
    await rider.save();

    return ride;
  }

  // Rate driver
  async rateDriver(rideId: string, riderId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const ride: any = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.riderId.toString() !== riderId) {
      throw new ApiError(403, "Not your ride");
    }

    if (ride.status !== RIDE_STATUS.COMPLETED) {
      throw new ApiError(400, "Can only rate completed rides");
    }

    if (ride.driverRating) {
      throw new ApiError(400, "You have already rated this ride");
    }

    const driver = await User.findById(ride.driverId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    // Update ride
    ride.driverRating = rating;
    await ride.save();

    // Update driver ratings
    driver.ratings = driver.ratings ? [...driver.ratings, rating] : [rating];
    driver.averageRating =
      driver.ratings.reduce((sum, r) => sum + r, 0) / driver.ratings.length;
    await driver.save();

    return { ride, driver };
  }

  // Leave feedback
  async leaveFeedback(rideId: string, riderId: string, feedback: string) {
    const ride: any = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.riderId.toString() !== riderId) {
      throw new ApiError(403, "Not your ride");
    }

    if (ride.status !== RIDE_STATUS.COMPLETED) {
      throw new ApiError(400, "Can only leave feedback for completed rides");
    }

    ride.riderFeedback = feedback;
    await ride.save();

    return ride;
  }

  // Find nearby drivers
  async findNearbyDrivers(location: string, maxDistance: number = 5000) {
    const { getCoordinatesFromAddress } = await import("../../utils/geoCode");
    const lonLat = await getCoordinatesFromAddress(location);

    const drivers = await User.find({
      role: "driver",
      isOnline: true,
      approvalStatus: "approved",
      status: "active",
      location: {
        $near: {
          $geometry: lonLat,
          $maxDistance: maxDistance,
        },
      },
    }).select("name vehicleInfo location averageRating");

    return drivers;
  }
}

export default new RideService();

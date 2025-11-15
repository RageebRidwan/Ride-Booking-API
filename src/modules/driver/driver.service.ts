import { Ride } from "../ride/ride.model";
import { User } from "../user/user.model";
import ApiError from "../../utils/ApiError";
import QueryBuilder from "../../utils/queryBuilder";
import { RIDE_STATUS } from "../../config/constants";

class DriverService {
  // Set availability (online/offline)
  async setAvailability(driverId: string, isOnline: boolean) {
    const driver = await User.findById(driverId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    if (driver.role !== "driver") {
      throw new ApiError(403, "Only drivers can set availability");
    }

    driver.isOnline = isOnline;
    await driver.save();

    return driver;
  }

  // Get pending ride requests (for drivers to accept)
  async getPendingRides(driverId: string, queryParams: any) {
    const driver = await User.findById(driverId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    if (driver.approvalStatus !== "approved") {
      throw new ApiError(403, "Driver not approved yet");
    }

    if (!driver.isOnline) {
      throw new ApiError(403, "Driver is currently offline");
    }

    // Find rides near the driver's location
    const query = Ride.find({
      status: RIDE_STATUS.REQUESTED,
      driverId: { $exists: false },
      cancelledByDriverId: { $ne: driverId },
    }).populate("riderId", "name phoneNumber");

    const queryBuilder = new QueryBuilder(query, queryParams).sort().paginate();

    const rides = await queryBuilder.query;
    const countQuery: any = Ride.find({
      status: RIDE_STATUS.REQUESTED,
      driverId: { $exists: false },
      cancelledByDriverId: { $ne: driverId },
    });
    const pagination = await queryBuilder.getPaginationInfo(countQuery);

    return { rides, pagination };
  }

  // Accept a ride
  async acceptRide(driverId: string, rideId: string) {
    const driver = await User.findById(driverId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    if (driver.approvalStatus !== "approved") {
      throw new ApiError(403, "Driver not approved yet");
    }

    if (!driver.isOnline) {
      throw new ApiError(403, "Driver is currently offline");
    }

    // Check if driver already has an active ride
    const activeRide = await Ride.findOne({
      driverId: driver.id,
      status: {
        $in: [
          RIDE_STATUS.ACCEPTED,
          RIDE_STATUS.PICKED_UP,
          RIDE_STATUS.IN_TRANSIT,
        ],
      },
    });

    if (activeRide) {
      throw new ApiError(403, "Driver is already on an active ride");
    }

    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.status !== RIDE_STATUS.REQUESTED) {
      throw new ApiError(400, "Ride cannot be accepted");
    }

    ride.driverId = driverId;
    ride.status = RIDE_STATUS.ACCEPTED;
    ride.timestamps.acceptedAt = new Date();
    await ride.save();

    return ride;
  }

  // Update ride status
  async updateRideStatus(
    driverId: string,
    rideId: string,
    status: "picked_up" | "in_transit" | "completed"
  ) {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.driverId?.toString() !== driverId) {
      throw new ApiError(403, "Not authorized");
    }

    const allowedStatuses = ["picked_up", "in_transit", "completed"];
    if (!allowedStatuses.includes(status)) {
      throw new ApiError(400, "Invalid status update");
    }

    ride.status = status as any;
    const timestampField = {
      picked_up: "pickedUpAt",
      in_transit: "inTransitAt",
      completed: "completedAt",
    }[status];

    (ride.timestamps as any)[timestampField] = new Date();
    await ride.save();

    return ride;
  }

  // Get driver's ride history
  async getDriverHistory(driverId: string, queryParams: any) {
    const query = Ride.find({ driverId }).populate(
      "riderId",
      "name email phoneNumber"
    );

    // Apply filters if provided
    const filters: any = {};

    if (queryParams.status) {
      filters.status = queryParams.status;
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
    const countQuery: any = Ride.find({ driverId, ...filters });
    const pagination = await queryBuilder.getPaginationInfo(countQuery);

    return { rides, pagination };
  }

  // Get earnings
  async getEarnings(driverId: string) {
    const rides = await Ride.find({
      driverId,
      status: RIDE_STATUS.COMPLETED,
    });

    const totalEarnings = rides.reduce(
      (total, ride) => total + (ride.fare || 0),
      0
    );

    // Group by time period (daily, weekly, monthly)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const dailyEarnings = rides
      .filter((r) => r.timestamps.completedAt! >= today)
      .reduce((sum, r) => sum + r.fare, 0);

    const weeklyEarnings = rides
      .filter((r) => r.timestamps.completedAt! >= thisWeekStart)
      .reduce((sum, r) => sum + r.fare, 0);

    const monthlyEarnings = rides
      .filter((r) => r.timestamps.completedAt! >= thisMonthStart)
      .reduce((sum, r) => sum + r.fare, 0);

    return {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      dailyEarnings: Math.round(dailyEarnings * 100) / 100,
      weeklyEarnings: Math.round(weeklyEarnings * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      totalRides: rides.length,
      rides,
    };
  }
  async cancelRide(driverId: string, rideId: string) {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ApiError(404, "Ride not found");
    }

    if (ride.driverId?.toString() !== driverId) {
      throw new ApiError(403, "Not authorized to cancel this ride");
    }

    // Can only cancel if accepted (not picked up yet)
    if (ride.status !== RIDE_STATUS.ACCEPTED) {
      throw new ApiError(400, "Can only cancel rides in 'accepted' status");
    }

    ride.status = RIDE_STATUS.REQUESTED;
    ride.timestamps.cancelledAt = new Date();
    // if (reason) ride.cancellationReason = reason;
    ride.cancelledByDriverId = driverId;
    ride.driverId = undefined; // Remove driver assignment
    await ride.save();

    return ride;
  }
}

export default new DriverService();

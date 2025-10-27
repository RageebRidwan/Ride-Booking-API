import { User } from "../user/user.model";
import { Ride } from "../ride/ride.model";
import ApiError from "../../utils/ApiError";
import QueryBuilder from "../../utils/queryBuilder";

class AdminService {
  // Get all users with pagination and filters
  async getAllUsers(queryParams: any) {
    const query = User.find().select("-password");

    // Apply filters
    const filters: any = {};

    if (queryParams.role) {
      filters.role = queryParams.role;
    }

    if (queryParams.status) {
      filters.status = queryParams.status;
    }

    if (queryParams.approvalStatus) {
      filters.approvalStatus = queryParams.approvalStatus;
    }

    if (queryParams.search) {
      filters.$or = [
        { name: { $regex: queryParams.search, $options: "i" } },
        { email: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    const queryBuilder = new QueryBuilder(query.find(filters), queryParams)
      .sort()
      .paginate();

    const users = await queryBuilder.query;
    const countQuery: any = User.find(filters);
    const pagination = await queryBuilder.getPaginationInfo(countQuery);

    return { users, pagination };
  }

  // Approve/reject driver
  async approveDriver(
    driverId: string,
    approvalStatus: "pending" | "approved" | "rejected"
  ) {
    const driver = await User.findById(driverId);
    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }

    if (driver.role !== "driver") {
      throw new ApiError(400, "User is not a driver");
    }

    driver.approvalStatus = approvalStatus;
    await driver.save();

    return driver;
  }

  // Block/suspend/activate user
  async updateUserStatus(
    userId: string,
    status: "active" | "blocked" | "suspended"
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.status = status;
    await user.save();

    return user;
  }

  // Get all rides with pagination and filters
  async getAllRides(queryParams: any) {
    const query = Ride.find()
      .populate("riderId", "name email phoneNumber")
      .populate("driverId", "name email phoneNumber vehicleInfo");

    // Apply filters
    const filters: any = {};

    if (queryParams.status) {
      filters.status = queryParams.status;
    }

    if (queryParams.riderId) {
      filters.riderId = queryParams.riderId;
    }

    if (queryParams.driverId) {
      filters.driverId = queryParams.driverId;
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
    const countQuery: any = Ride.find(filters);
    const pagination = await queryBuilder.getPaginationInfo(countQuery);

    return { rides, pagination };
  }

  // Get user statistics
  async getUserStats() {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalRiders = await User.countDocuments({ role: "rider" });
    const totalDrivers = await User.countDocuments({ role: "driver" });

    const activeUsers = await User.countDocuments({ status: "active" });
    const blockedUsers = await User.countDocuments({ status: "blocked" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    const pendingDrivers = await User.countDocuments({
      role: "driver",
      approvalStatus: "pending",
    });
    const approvedDrivers = await User.countDocuments({
      role: "driver",
      approvalStatus: "approved",
    });

    return {
      totalUsers,
      totalAdmins,
      totalRiders,
      totalDrivers,
      activeUsers,
      blockedUsers,
      suspendedUsers,
      pendingDrivers,
      approvedDrivers,
    };
  }

  // Get ride statistics
  async getRideStats() {
    const totalRides = await Ride.countDocuments();
    const completedRides = await Ride.countDocuments({ status: "completed" });
    const cancelledRides = await Ride.countDocuments({ status: "cancelled" });
    const inProgressRides = await Ride.countDocuments({
      status: { $in: ["accepted", "picked_up", "in_transit"] },
    });
    const requestedRides = await Ride.countDocuments({ status: "requested" });

    // Calculate total revenue
    const completedRidesData = await Ride.find({ status: "completed" });
    const totalRevenue = completedRidesData.reduce(
      (sum, ride) => sum + ride.fare,
      0
    );

    return {
      totalRides,
      completedRides,
      cancelledRides,
      inProgressRides,
      requestedRides,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }

  // Get driver ratings stats
  async getDriverRatings() {
    const drivers = await User.find({ role: "driver" }).select(
      "name email averageRating ratings vehicleInfo"
    );

    const ratings = drivers.map((d) => d.averageRating || 0);
    const totalDrivers = ratings.length;
    const avgRating =
      totalDrivers > 0 ? ratings.reduce((a, b) => a + b, 0) / totalDrivers : 0;

    const topDrivers = drivers
      .filter((d) => d.averageRating && d.averageRating > 0)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 10);

    return {
      totalDrivers,
      avgRating: Math.round(avgRating * 100) / 100,
      topDrivers,
    };
  }
}

export default new AdminService();

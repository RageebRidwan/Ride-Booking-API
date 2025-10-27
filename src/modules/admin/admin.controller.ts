import { Request, Response, NextFunction } from "express";
import AdminService from "./admin.service";
import ApiResponse from "../../utils/ApiResponse";

class AdminController {
  // GET /admin/users
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { users, pagination } = await AdminService.getAllUsers(req.query);
      ApiResponse.paginated(
        res,
        200,
        "Users retrieved successfully",
        users,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/drivers/approve/:id
  async approveDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { approvalStatus } = req.body;
      const driver = await AdminService.approveDriver(
        req.params.id,
        approvalStatus
      );
      ApiResponse.success(res, 200, `Driver ${approvalStatus}`, { driver });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /admin/users/block/:id
  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const user = await AdminService.updateUserStatus(req.params.id, status);
      ApiResponse.success(res, 200, `User ${status}`, { user });
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/rides
  async getAllRides(req: Request, res: Response, next: NextFunction) {
    try {
      const { rides, pagination } = await AdminService.getAllRides(req.query);
      ApiResponse.paginated(
        res,
        200,
        "Rides retrieved successfully",
        rides,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/users/stats
  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getUserStats();
      ApiResponse.success(res, 200, "User stats retrieved successfully", stats);
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/rides/stats
  async getRideStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AdminService.getRideStats();
      ApiResponse.success(res, 200, "Ride stats retrieved successfully", stats);
    } catch (error) {
      next(error);
    }
  }

  // GET /admin/drivers/ratings
  async getDriverRatings(req: Request, res: Response, next: NextFunction) {
    try {
      const ratings = await AdminService.getDriverRatings();
      ApiResponse.success(
        res,
        200,
        "Driver ratings retrieved successfully",
        ratings
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();

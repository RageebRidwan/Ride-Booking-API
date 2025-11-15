import { Request, Response, NextFunction } from "express";
import DriverService from "./driver.service";
import ApiResponse from "../../utils/ApiResponse";

class DriverController {
  // PATCH /drivers/availability
  async setAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { isOnline } = req.body;
      const driver = await DriverService.setAvailability(
        req.user!.id,
        isOnline
      );
      ApiResponse.success(
        res,
        200,
        `Driver is now ${isOnline ? "online" : "offline"}`,
        { driver }
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /drivers/rides/pending
  async getPendingRides(req: Request, res: Response, next: NextFunction) {
    try {
      const { rides, pagination } = await DriverService.getPendingRides(
        req.user!.id,
        req.query
      );
      ApiResponse.paginated(
        res,
        200,
        "Pending rides retrieved successfully",
        rides,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // PATCH /drivers/rides/:id/accept
  async acceptRide(req: Request, res: Response, next: NextFunction) {
    try {
      const ride = await DriverService.acceptRide(req.user!.id, req.params.id);
      ApiResponse.success(res, 200, "Ride accepted successfully", { ride });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /drivers/rides/:id/status
  async updateRideStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const ride = await DriverService.updateRideStatus(
        req.user!.id,
        req.params.id,
        status
      );
      ApiResponse.success(res, 200, `Ride status updated to ${status}`, {
        ride,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /drivers/rides/history
  async getDriverHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { rides, pagination } = await DriverService.getDriverHistory(
        req.user!.id,
        req.query
      );
      ApiResponse.paginated(
        res,
        200,
        "Driver ride history retrieved successfully",
        rides,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /drivers/rides/earnings
  async getEarnings(req: Request, res: Response, next: NextFunction) {
    try {
      const earnings = await DriverService.getEarnings(req.user!.id);
      ApiResponse.success(
        res,
        200,
        "Earnings retrieved successfully",
        earnings
      );
    } catch (error) {
      next(error);
    }
  }
  async cancelRide(req: Request, res: Response, next: NextFunction) {
    try {
      const ride = await DriverService.cancelRide(req.user!.id, req.params.id);
      ApiResponse.success(res, 200, "Ride cancelled successfully", { ride });
    } catch (error) {
      next(error);
    }
  }
}

export default new DriverController();

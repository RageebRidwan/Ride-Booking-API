// src/modules/ride/ride.controller.ts
import { Request, Response, NextFunction } from "express";
import RideService from "./ride.service";
import ApiResponse from "../../utils/ApiResponse";

class RideController {
  // POST /rides/request
  async requestRide(req: Request, res: Response, next: NextFunction) {
    try {
      const { pickup, destination } = req.body;
      const ride = await RideService.requestRide(
        req.user!.id,
        pickup,
        destination
      );
      ApiResponse.success(res, 201, "Ride requested successfully", { ride });
    } catch (error) {
      next(error);
    }
  }

  // GET /rides/history
  async getRiderHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { rides, pagination } = await RideService.getRiderHistory(
        req.user!.id,
        req.query
      );
      ApiResponse.paginated(
        res,
        200,
        "Ride history retrieved successfully",
        rides,
        pagination
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /rides/:id
  async getRideById(req: Request, res: Response, next: NextFunction) {
    try {
      const ride = await RideService.getRideById(
        req.params.id,
        req.user!.id,
        req.user!.role
      );
      ApiResponse.success(res, 200, "Ride details retrieved successfully", {
        ride,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /rides/:id/cancel
  async cancelRide(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      const ride = await RideService.cancelRide(
        req.params.id,
        req.user!.id,
        reason
      );
      ApiResponse.success(res, 200, "Ride cancelled successfully", { ride });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /rides/:id/rate-driver
  async rateDriver(req: Request, res: Response, next: NextFunction) {
    try {
      const { rating } = req.body;
      const result = await RideService.rateDriver(
        req.params.id,
        req.user!.id,
        rating
      );
      ApiResponse.success(res, 200, "Driver rated successfully", result);
    } catch (error) {
      next(error);
    }
  }

  // PATCH /rides/:id/feedback
  async leaveFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { feedback } = req.body;
      const ride = await RideService.leaveFeedback(
        req.params.id,
        req.user!.id,
        feedback
      );
      ApiResponse.success(res, 200, "Feedback submitted successfully", {
        ride,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /rides/drivers/nearby
  async findNearbyDrivers(req: Request, res: Response, next: NextFunction) {
    try {
      const { loc, maxDistance } = req.body;
      const drivers = await RideService.findNearbyDrivers(loc, maxDistance);
      ApiResponse.success(res, 200, "Nearby drivers retrieved successfully", {
        drivers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RideController();

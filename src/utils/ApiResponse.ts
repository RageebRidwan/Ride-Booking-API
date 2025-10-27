import { Response } from "express";

class ApiResponse {
  static success(
    res: Response,
    statusCode: number,
    message: string,
    data?: any
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: any
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated(
    res: Response,
    statusCode: number,
    message: string,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      pagination,
    });
  }
}

export default ApiResponse;

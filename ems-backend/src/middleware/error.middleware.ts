import { Request, Response, NextFunction } from "express";
import { ApiError } from "@/utils/apiError";
import { logger } from "@/utils/logger";
import { config } from "@/config";
import { HTTP_STATUS } from "@/constants";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, {
    stack: err.stack,
    body: req.body,
  });

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      ...(config.isDev && { stack: err.stack }),
    });
    return;
  }

  // Prisma unique constraint
  if ("code" in err && (err as NodeJS.ErrnoException).code === "P2002") {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: "A record with this value already exists",
    });
    return;
  }

  // Prisma record not found
  if ("code" in err && (err as NodeJS.ErrnoException).code === "P2025") {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: "Record not found",
    });
    return;
  }

  res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: "Internal server error",
    ...(config.isDev && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
}

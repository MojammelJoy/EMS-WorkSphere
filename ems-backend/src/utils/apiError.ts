import { HTTP_STATUS } from "@/constants";

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode = HTTP_STATUS.INTERNAL_ERROR,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new ApiError(message, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(message = "Not found") {
    return new ApiError(message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(message: string) {
    return new ApiError(message, HTTP_STATUS.CONFLICT);
  }

  static internal(message = "Internal server error") {
    return new ApiError(message, HTTP_STATUS.INTERNAL_ERROR);
  }
}

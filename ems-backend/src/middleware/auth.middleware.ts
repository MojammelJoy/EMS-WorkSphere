import { Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import type { AuthRequest } from "@/types";
import type { Role } from "@prisma/client";

export const authenticate = asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) throw ApiError.unauthorized("Access token required");

  const token = header.split(" ")[1];
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    throw ApiError.unauthorized("Invalid or expired access token");
  }
});

export const authorize = (...roles: Role[]) =>
  asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden("Insufficient permissions");
    next();
  });

export const requireOwnerOrAdmin = (getResourceUserId: (req: AuthRequest) => string | undefined) =>
  asyncHandler(async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) throw ApiError.unauthorized();
    const { role, userId } = req.user;
    if (role === "ADMIN" || role === "HR") return next();
    const resourceUserId = getResourceUserId(req);
    if (resourceUserId !== userId) throw ApiError.forbidden();
    next();
  });

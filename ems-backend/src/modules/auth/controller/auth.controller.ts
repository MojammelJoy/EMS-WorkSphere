import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendNoContent } from "@/utils/apiResponse";
import {
  loginService, logoutService, refreshTokenService,
  forgotPasswordService, resetPasswordService, changePasswordService,
} from "../service/auth.service";
import { JWT } from "@/constants";
import type { AuthRequest } from "@/types";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   JWT.COOKIE_MAX_AGE,
  });

  sendSuccess(res, {
    user:   result.user,
    tokens: {
      accessToken:  result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn:    900,
    },
  }, "Login successful");
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await logoutService(req.user!.userId);
  res.clearCookie("refreshToken");
  sendNoContent(res);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.cookies as Record<string, string>).refreshToken
    ?? req.body.refreshToken as string | undefined;
  if (!token) throw new (await import("@/utils/apiError")).ApiError("Refresh token required", 401);

  const tokens = await refreshTokenService(token);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge:   JWT.COOKIE_MAX_AGE,
  });

  sendSuccess(res, { accessToken: tokens.accessToken }, "Token refreshed");
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await forgotPasswordService(req.body.email as string);
  sendSuccess(res, null, "If this email is registered, a reset link has been sent");
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body as { token: string; password: string };
  await resetPasswordService(token, password);
  sendSuccess(res, null, "Password reset successfully");
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  await changePasswordService(req.user!.userId, currentPassword, newPassword);
  sendSuccess(res, null, "Password changed successfully");
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { default: prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      employee: {
        select: {
          id: true, firstName: true, lastName: true,
          designation: true, department: { select: { name: true } },
          profileImage: true,
        },
      },
    },
  });
  sendSuccess(res, user, "User fetched");
});

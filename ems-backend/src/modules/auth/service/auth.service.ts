import prisma from "@/lib/prisma";
import { cache } from "@/lib/redis";
import { sendEmail, emailTemplates } from "@/lib/resend";
import { ApiError } from "@/utils/apiError";
import { hashPassword, comparePassword, generateToken, generateTempPassword } from "@/utils/helpers";
import { generateTokenPair, verifyRefreshToken } from "@/utils/jwt";
import { config } from "@/config";
import type { LoginPayload } from "./auth.types";

export async function loginService(payload: LoginPayload) {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, profileImage: true } },
    },
  });

  if (!user || !user.isActive) throw ApiError.unauthorized("Invalid credentials");
  const valid = await comparePassword(payload.password, user.password);
  if (!valid) throw ApiError.unauthorized("Invalid credentials");

  const tokens = generateTokenPair({
    userId: user.id,
    email:  user.email,
    role:   user.role,
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, lastLoginAt: new Date() },
  });

  const name = user.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`
    : user.email;

  return {
    user: {
      id:     user.id,
      email:  user.email,
      role:   user.role,
      name,
      avatar: user.employee?.profileImage,
      employeeId: user.employee?.id,
    },
    tokens,
  };
}

export async function refreshTokenService(token: string) {
  let payload;
  try { payload = verifyRefreshToken(token); }
  catch { throw ApiError.unauthorized("Invalid refresh token"); }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, refreshToken: token, isActive: true },
  });
  if (!user) throw ApiError.unauthorized("Refresh token revoked");

  const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken: tokens.refreshToken } });
  return tokens;
}

export async function logoutService(userId: string) {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
  await cache.del(`user:${userId}`);
}

export async function forgotPasswordService(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return; // silently succeed

  const token   = generateToken();
  const expiry  = new Date(Date.now() + 60 * 60 * 1000);
  const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

  await prisma.user.update({
    where: { id: user.id },
    data:  { resetPasswordToken: token, resetPasswordExpiry: expiry },
  });

  await sendEmail({
    to:      email,
    subject: "Reset your WorkSphere password",
    html:    emailTemplates.resetPassword(email, resetUrl),
  });
}

export async function resetPasswordService(token: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken:  token,
      resetPasswordExpiry: { gt: new Date() },
    },
  });
  if (!user) throw ApiError.badRequest("Invalid or expired reset token");

  const hashed = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password:            hashed,
      resetPasswordToken:  null,
      resetPasswordExpiry: null,
      refreshToken:        null,
    },
  });
}

export async function changePasswordService(userId: string, current: string, newPass: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound("User not found");

  const valid = await comparePassword(current, user.password);
  if (!valid) throw ApiError.badRequest("Current password is incorrect");

  const hashed = await hashPassword(newPass);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
}

export interface LoginPayload {
  email: string;
  password: string;
}

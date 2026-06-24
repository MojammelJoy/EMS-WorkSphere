import jwt from "jsonwebtoken";
import { config } from "@/config";
import type { AuthPayload, JwtTokens } from "@/types";

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.accessSecret) as AuthPayload;
}

export function verifyRefreshToken(token: string): AuthPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthPayload;
}

export function generateTokenPair(payload: AuthPayload): JwtTokens {
  return {
    accessToken:  signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

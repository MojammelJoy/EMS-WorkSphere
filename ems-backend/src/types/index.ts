import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export interface UploadedFile {
  url: string;
  publicId: string;
  format: string;
  size: number;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

import { Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "@/utils/apiResponse";
import {
  listEmployees, getEmployeeById, createEmployee,
  updateEmployee, deleteEmployee, uploadEmployeeAvatar,
} from "../service/employee.service";
import type { AuthRequest } from "@/types";

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await listEmployees(req.query as never);
  sendSuccess(res, result, "Employees fetched");
});

export const getById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await getEmployeeById(req.params.id);
  sendSuccess(res, employee, "Employee fetched");
});

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await createEmployee(req.body as never, req.user!.userId);
  sendCreated(res, employee, "Employee created successfully");
});

export const update = asyncHandler(async (req: AuthRequest, res: Response) => {
  const employee = await updateEmployee(req.params.id, req.body as never);
  sendSuccess(res, employee, "Employee updated");
});

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  await deleteEmployee(req.params.id);
  sendNoContent(res);
});

export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) throw new (await import("@/utils/apiError")).ApiError("No file uploaded", 400);
  const employee = await uploadEmployeeAvatar(req.params.id, req.file.buffer);
  sendSuccess(res, { avatar: (employee as { profileImage?: string }).profileImage }, "Avatar updated");
});

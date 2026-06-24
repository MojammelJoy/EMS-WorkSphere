import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { clockInSchema, clockOutSchema } from "@/validators";
import {
  clockIn, clockOut, getTodayStatus,
  listAttendance, getMonthlyAttendance, getAttendanceSummary,
} from "../service/attendance.service";
import type { AuthRequest } from "@/types";

const router = Router();
router.use(authenticate);

router.post("/clock-in", validate(clockInSchema), asyncHandler(async (req: AuthRequest, res) => {
  const empId = await getEmployeeId(req.user!.userId);
  sendSuccess(res, await clockIn(empId, req.body.note, req.body.location), "Clocked in");
}));

router.post("/clock-out", validate(clockOutSchema), asyncHandler(async (req: AuthRequest, res) => {
  const empId = await getEmployeeId(req.user!.userId);
  sendSuccess(res, await clockOut(empId, req.body.note), "Clocked out");
}));

router.get("/today", asyncHandler(async (req: AuthRequest, res) => {
  const empId = await getEmployeeId(req.user!.userId);
  sendSuccess(res, await getTodayStatus(empId), "Today attendance");
}));

router.get("/", authorize("ADMIN", "HR"), asyncHandler(async (req, res) => {
  sendSuccess(res, await listAttendance(req.query as never), "Attendance list");
}));

router.get("/monthly/:employeeId", asyncHandler(async (req, res) => {
  const { month, year } = req.query as { month: string; year: string };
  sendSuccess(res, await getMonthlyAttendance(req.params.employeeId, +month, +year), "Monthly attendance");
}));

router.get("/summary/:employeeId", asyncHandler(async (req, res) => {
  const { month, year } = req.query as { month: string; year: string };
  sendSuccess(res, await getAttendanceSummary(req.params.employeeId, +month, +year), "Attendance summary");
}));

async function getEmployeeId(userId: string): Promise<string> {
  const { default: prisma } = await import("@/lib/prisma");
  const employee = await prisma.employee.findUnique({ where: { userId }, select: { id: true } });
  if (!employee) throw new (await import("@/utils/apiError")).ApiError("Employee profile not found", 404);
  return employee.id;
}

export default router;

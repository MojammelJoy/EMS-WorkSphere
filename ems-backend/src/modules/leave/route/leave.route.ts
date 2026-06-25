import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { applyLeaveSchema, rejectLeaveSchema } from "@/validators";
import {
  applyLeave, listLeaveRequests, approveLeave,
  rejectLeave, cancelLeave, getLeaveBalance,
} from "../service/leave.service";
import type { AuthRequest } from "@/types";

const router = Router();
router.use(authenticate);

router.get("/", authorize("ADMIN", "HR"), asyncHandler(async (req, res) => {
  sendSuccess(res, await listLeaveRequests(req.query as never), "Leave requests");
}));

router.post("/", validate(applyLeaveSchema), asyncHandler(async (req: AuthRequest, res) => {
  const empId = await getEmpId(req.user!.userId);
  sendSuccess(res, await applyLeave(empId, req.body as never), "Leave applied");
}));

router.patch("/:id/approve", authorize("ADMIN", "HR"), asyncHandler(async (req: AuthRequest, res) => {
  sendSuccess(res, await approveLeave(String(req.params.id), req.user!.userId), "Leave approved");
}));

router.patch("/:id/reject", authorize("ADMIN", "HR"), validate(rejectLeaveSchema), asyncHandler(async (req: AuthRequest, res) => {
  sendSuccess(res, await rejectLeave(String(req.params.id), req.user!.userId, req.body.reason as string), "Leave rejected");
}));

router.patch("/:id/cancel", asyncHandler(async (req: AuthRequest, res) => {
  const empId = await getEmpId(req.user!.userId);
  sendSuccess(res, await cancelLeave(String(req.params.id), empId), "Leave cancelled");
}));

router.get("/balance/:employeeId", asyncHandler(async (req, res) => {
  sendSuccess(res, await getLeaveBalance(String(req.params.employeeId)), "Leave balance");
}));

async function getEmpId(userId: string) {
  const { default: prisma } = await import("@/lib/prisma");
  const e = await prisma.employee.findUnique({ where: { userId }, select: { id: true } });
  if (!e) throw new (await import("@/utils/apiError")).ApiError("Employee not found", 404);
  return e.id;
}

export default router;

import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { processPayrollSchema } from "@/validators";
import {
  listPayroll, processMonthlyPayroll,
  getMyPayslips, markAsPaid,
} from "../service/payroll.service";
import type { AuthRequest } from "@/types";

const router = Router();
router.use(authenticate);

router.get("/", authorize("ADMIN"), asyncHandler(async (req, res) => {
  sendSuccess(res, await listPayroll(req.query as never), "Payroll list");
}));

router.post("/process", authorize("ADMIN"), validate(processPayrollSchema), asyncHandler(async (req, res) => {
  const { month, year } = req.body as { month: number; year: number };
  sendSuccess(res, await processMonthlyPayroll(month, year), "Payroll processed");
}));

router.get("/my", asyncHandler(async (req: AuthRequest, res) => {
  sendSuccess(res, await getMyPayslips(req.user!.userId), "My payslips");
}));

router.patch("/:id/paid", authorize("ADMIN"), asyncHandler(async (req, res) => {
  sendSuccess(res, await markAsPaid(req.params.id), "Marked as paid");
}));

export default router;

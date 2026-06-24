import { Router } from "express";
import authRoutes         from "@/modules/auth/route/auth.route";
import employeeRoutes     from "@/modules/employees/route/employee.route";
import departmentRoutes   from "@/modules/departments/route/department.route";
import attendanceRoutes   from "@/modules/attendance/route/attendance.route";
import leaveRoutes        from "@/modules/leave/route/leave.route";
import payrollRoutes      from "@/modules/payroll/route/payroll.route";
import notificationRoutes from "@/modules/notifications/route/notification.route";
import documentRoutes     from "@/modules/documents/route/document.route";
import auditLogRoutes     from "@/modules/auditLogs/route/auditLog.route";
import reportsRoutes      from "@/modules/reports/route/reports.route";

const router = Router();

router.use("/auth",          authRoutes);
router.use("/employees",     employeeRoutes);
router.use("/departments",   departmentRoutes);
router.use("/attendance",    attendanceRoutes);
router.use("/leave",         leaveRoutes);
router.use("/payroll",       payrollRoutes);
router.use("/notifications", notificationRoutes);
router.use("/documents",     documentRoutes);
router.use("/audit-logs",    auditLogRoutes);
router.use("/dashboard",     reportsRoutes);
router.use("/reports",       reportsRoutes);

export default router;

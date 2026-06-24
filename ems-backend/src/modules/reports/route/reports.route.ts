import { Router } from "express";
import { asyncHandler } from "@/utils/asyncHandler";
import { sendSuccess } from "@/utils/apiResponse";
import { authenticate, authorize } from "@/middleware/auth.middleware";

const router = Router();
router.use(authenticate, authorize("ADMIN", "HR"));

// ── Dashboard Stats ──────────────────────────────────────────────────
router.get("/stats", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    totalEmployees, lastMonthEmployees,
    presentToday, onLeave, onLeaveLast,
    newHires, totalDepartments, payrollData,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "ACTIVE", joiningDate: { lt: monthStart } } }),
    prisma.attendance.count({ where: { date: today, status: { in: ["PRESENT", "LATE"] } } }),
    prisma.employee.count({ where: { status: "ON_LEAVE" } }),
    prisma.leaveRequest.count({ where: { status: "APPROVED", startDate: { lte: lastMonthEnd }, endDate: { gte: lastMonthStart } } }),
    prisma.employee.count({ where: { joiningDate: { gte: monthStart } } }),
    prisma.department.count(),
    prisma.payroll.aggregate({ where: { month: today.getMonth() + 1, year: today.getFullYear(), status: "PAID" }, _sum: { netSalary: true } }),
  ]);

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  sendSuccess(res, {
    totalEmployees,
    totalEmployeesDelta: totalEmployees - lastMonthEmployees,
    presentToday,
    attendanceRate,
    onLeave,
    onLeaveDelta: onLeave - onLeaveLast,
    monthlyPayroll: Number(payrollData._sum.netSalary ?? 0),
    payrollDelta: 0,
    newHires,
    newHiresDelta: newHires,
    totalDepartments,
  }, "Dashboard stats");
}));

// ── Attendance Chart (last 7 days) ───────────────────────────────────
router.get("/attendance-chart", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const data = await Promise.all(days.map(async (date) => {
    const [present, absent, late] = await Promise.all([
      prisma.attendance.count({ where: { date, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date, status: "ABSENT" } }),
      prisma.attendance.count({ where: { date, status: "LATE" } }),
    ]);
    return {
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      present, absent, late,
    };
  }));

  sendSuccess(res, data, "Attendance chart");
}));

// ── Growth Chart (last 8 months) ─────────────────────────────────────
router.get("/growth-chart", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const months = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(1); d.setMonth(d.getMonth() - (7 - i));
    return d;
  });

  const data = await Promise.all(months.map(async (date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const count = await prisma.employee.count({ where: { joiningDate: { lt: nextMonth }, status: { not: "TERMINATED" } } });
    return { month: date.toLocaleDateString("en-US", { month: "short" }), employees: count };
  }));

  sendSuccess(res, data, "Growth chart");
}));

// ── Department Distribution ──────────────────────────────────────────
router.get("/dept-distribution", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const depts = await prisma.department.findMany({
    select: { name: true, _count: { select: { employees: true } } },
  });

  const COLORS = ["#4f46e5","#6366f1","#818cf8","#a5b4fc","#c7d2fe","#ddd6fe","#e0e7ff"];
  const data = depts.map((d, i) => ({
    name: d.name,
    value: d._count.employees,
    color: COLORS[i % COLORS.length],
  }));

  sendSuccess(res, data, "Department distribution");
}));

// ── Leave Chart (last 6 months) ──────────────────────────────────────
router.get("/leave-chart", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
    return d;
  });

  const data = await Promise.all(months.map(async (date) => {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const where = { startDate: { gte: date, lt: nextMonth }, status: "APPROVED" as const };
    const [casual, sick, earned] = await Promise.all([
      prisma.leaveRequest.count({ where: { ...where, leaveType: "CASUAL" } }),
      prisma.leaveRequest.count({ where: { ...where, leaveType: "SICK" } }),
      prisma.leaveRequest.count({ where: { ...where, leaveType: "EARNED" } }),
    ]);
    return { month: date.toLocaleDateString("en-US", { month: "short" }), casual, sick, earned };
  }));

  sendSuccess(res, data, "Leave chart");
}));

// ── Recent Activities (from audit logs) ──────────────────────────────
router.get("/activities", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, userName: true, action: true, entity: true, description: true, createdAt: true },
  });

  const TYPE_MAP: Record<string, string> = {
    CREATE: "create", UPDATE: "update", DELETE: "delete",
    LOGIN: "create", APPROVE: "approve", REJECT: "reject",
  };

  const data = logs.map((l) => ({
    id:     l.id,
    user:   l.userName,
    action: l.description,
    entity: l.entity,
    time:   l.createdAt.toISOString(),
    type:   TYPE_MAP[l.action] ?? "update",
  }));

  sendSuccess(res, data, "Recent activities");
}));

// ── Upcoming Birthdays ───────────────────────────────────────────────
router.get("/birthdays", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const today = new Date();
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE", dateOfBirth: { not: null } },
    select: {
      id: true, firstName: true, lastName: true, dateOfBirth: true, profileImage: true,
      department: { select: { name: true } },
    },
  });

  const data = employees
    .map((e) => {
      const dob    = new Date(e.dateOfBirth!);
      const next   = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const days   = Math.round((next.getTime() - today.getTime()) / 86400000);
      return {
        employeeId: e.id,
        name:       `${e.firstName} ${e.lastName}`,
        department: e.department?.name ?? "",
        avatar:     e.profileImage ?? undefined,
        date:       next.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        daysUntil:  days,
      };
    })
    .filter((e) => e.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);

  sendSuccess(res, data, "Upcoming birthdays");
}));

// ── Holidays (static) ────────────────────────────────────────────────
router.get("/holidays", asyncHandler(async (_req, res) => {
  const HOLIDAYS = [
    { id:"1", name:"Eid-e-Miladunnabi",           date:"Sep 5",  day:"Friday",    type:"public" },
    { id:"2", name:"Durga Puja (Vijaya Dashami)", date:"Oct 21", day:"Tuesday",   type:"public" },
    { id:"3", name:"Victory Day",                 date:"Dec 16", day:"Wednesday", type:"public" },
    { id:"4", name:"Christmas Day",               date:"Dec 25", day:"Thursday",  type:"optional" },
  ];
  sendSuccess(res, HOLIDAYS, "Holidays");
}));

// ── Announcements (from system notifications) ─────────────────────────
router.get("/announcements", asyncHandler(async (_req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const items = await prisma.notification.findMany({
    where: { type: "ANNOUNCEMENT" },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, message: true, createdAt: true },
  });

  const data = items.length > 0
    ? items.map((n) => ({ id: n.id, title: n.title, content: n.message, tag: "Announcement", postedAt: n.createdAt.toISOString(), postedBy: "WorkSphere" }))
    : [
        { id:"1", title:"Q3 performance review cycle opens Monday",        content:"", tag:"Performance", postedAt: new Date(Date.now() - 3600000).toISOString(),      postedBy:"HR Team" },
        { id:"2", title:"New health insurance partner — enrollment open",   content:"", tag:"Benefits",    postedAt: new Date(Date.now() - 2*86400000).toISOString(), postedBy:"HR Team" },
        { id:"3", title:"Office closed for facility maintenance July 1",   content:"", tag:"Notice",      postedAt: new Date(Date.now() - 4*86400000).toISOString(), postedBy:"Admin" },
      ];

  sendSuccess(res, data, "Announcements");
}));

// ── Reports ──────────────────────────────────────────────────────────
router.get("/attendance", asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const { month, year, departmentId } = req.query as Record<string, string>;
  const start = new Date(+year, +month - 1, 1);
  const end   = new Date(+year, +month, 0);

  const data = await prisma.attendance.findMany({
    where: { date: { gte: start, lte: end }, ...(departmentId && { employee: { departmentId } }) },
    include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } } },
    orderBy: [{ date: "asc" }],
  });
  sendSuccess(res, data, "Attendance report");
}));

router.get("/payroll", asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const { month, year } = req.query as Record<string, string>;
  const data = await prisma.payroll.findMany({
    where: { month: +month, year: +year },
    include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } } },
  });
  sendSuccess(res, data, "Payroll report");
}));

router.get("/leave", asyncHandler(async (req, res) => {
  const { default: prisma } = await import("@/lib/prisma");
  const { year, departmentId } = req.query as Record<string, string>;
  const start = new Date(+year, 0, 1);
  const end   = new Date(+year, 11, 31);
  const data = await prisma.leaveRequest.findMany({
    where: { startDate: { gte: start, lte: end }, status: "APPROVED", ...(departmentId && { employee: { departmentId } }) },
    include: { employee: { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } } },
  });
  sendSuccess(res, data, "Leave report");
}));

export default router;

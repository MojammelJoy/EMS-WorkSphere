import { Inngest } from "inngest";
import { config } from "@/config";
import { logger } from "@/utils/logger";

export const inngest = new Inngest({
  id:       "ems-backend",
  eventKey: config.inngest.eventKey || "local",
});

/* ── Monthly Payroll Auto-Generation ── */
export const monthlyPayrollJob = inngest.createFunction(
  { id: "monthly-payroll", name: "Monthly Payroll Generation" },
  { cron: "0 9 1 * *" }, // 1st of every month at 9AM
  async () => {
    const now = new Date();
    const month = now.getMonth() === 0 ? 12 : now.getMonth();
    const year  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    logger.info(`Auto-generating payroll for ${month}/${year}`);
    const { processMonthlyPayroll } = await import("@/modules/payroll/service/payroll.service");
    const result = await processMonthlyPayroll(month, year);
    logger.info("Payroll auto-generated", result);
    return result;
  }
);

/* ── Daily Attendance Summary ── */
export const dailyAttendanceSummaryJob = inngest.createFunction(
  { id: "daily-attendance-summary", name: "Daily Attendance Summary" },
  { cron: "0 20 * * 1-5" }, // Mon-Fri at 8PM
  async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const today = new Date(); today.setHours(0, 0, 0, 0);

    const [present, absent, late] = await Promise.all([
      prisma.attendance.count({ where: { date: today, status: "PRESENT" } }),
      prisma.attendance.count({ where: { date: today, status: "ABSENT"  } }),
      prisma.attendance.count({ where: { date: today, status: "LATE"    } }),
    ]);

    logger.info(`Daily summary — Present: ${present}, Absent: ${absent}, Late: ${late}`);

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true } });
    const { createBulkNotifications } = await import("@/services/notification.service");
    await createBulkNotifications(admins.map((a) => ({
      userId:  a.id,
      title:   "Daily Attendance Summary",
      message: `Present: ${present} · Absent: ${absent} · Late: ${late}`,
      type:    "ATTENDANCE_ALERT" as const,
      link:    "/attendance",
    })));
  }
);

/* ── Birthday Notifications ── */
export const birthdayNotificationJob = inngest.createFunction(
  { id: "birthday-notifications", name: "Birthday Notifications" },
  { cron: "0 8 * * *" }, // Every day at 8AM
  async () => {
    const { default: prisma } = await import("@/lib/prisma");
    const today = new Date();
    const month = today.getMonth() + 1;
    const day   = today.getDate();

    const employees = await prisma.employee.findMany({
      where: {
        dateOfBirth: { not: null },
        status:      "ACTIVE",
      },
      include: { user: { select: { id: true } } },
    });

    const birthdays = employees.filter((e) => {
      if (!e.dateOfBirth) return false;
      const dob = new Date(e.dateOfBirth);
      return dob.getMonth() + 1 === month && dob.getDate() === day;
    });

    if (birthdays.length === 0) return;

    logger.info(`Birthday notifications: ${birthdays.length} employees`);

    const allUsers = await prisma.user.findMany({ where: { isActive: true } });
    const { createBulkNotifications } = await import("@/services/notification.service");

    for (const emp of birthdays) {
      await createBulkNotifications(allUsers.map((u) => ({
        userId:  u.id,
        title:   `🎂 Happy Birthday, ${emp.firstName}!`,
        message: `Today is ${emp.firstName} ${emp.lastName}'s birthday. Wish them well!`,
        type:    "BIRTHDAY" as const,
      })));
    }
  }
);

export const inngestFunctions = [
  monthlyPayrollJob,
  dailyAttendanceSummaryJob,
  birthdayNotificationJob,
];

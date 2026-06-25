import prisma from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination";
import { calcWorkingHours, isLate } from "@/utils/helpers";
import { ATTENDANCE } from "@/constants";
import type { PaginationQuery } from "@/types";
import type { Prisma } from "@prisma/client";

export async function clockIn(employeeId: string, note?: string, location?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });

  if (existing?.checkIn) throw ApiError.conflict("Already clocked in today");

  const now = new Date();
  const late = isLate(now, ATTENDANCE.LATE_THRESHOLD_MINUTES);

  return prisma.attendance.upsert({
    where:  { employeeId_date: { employeeId, date: today } },
    create: { employeeId, date: today, checkIn: now, status: late ? "LATE" : "PRESENT", note, location },
    update: { checkIn: now, status: late ? "LATE" : "PRESENT", note, location },
  });
}

export async function clockOut(employeeId: string, note?: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const record = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });

  if (!record?.checkIn)  throw ApiError.badRequest("No clock-in found for today");
  if (record?.checkOut)  throw ApiError.conflict("Already clocked out today");

  const now = new Date();
  const hours = calcWorkingHours(record.checkIn, now);
  const overtime = Math.max(0, hours - ATTENDANCE.STANDARD_HOURS);

  let status = record.status;
  if (hours < ATTENDANCE.HALF_DAY_HOURS) status = "HALF_DAY";

  return prisma.attendance.update({
    where:  { employeeId_date: { employeeId, date: today } },
    data:   { checkOut: now, workingHours: hours, overtimeHours: overtime, status, note },
  });
}

export async function getTodayStatus(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId, date: today } },
  });
}

export async function listAttendance(
  query: PaginationQuery & { date?: string; departmentId?: string; employeeId?: string }
) {
  const { page, limit, skip, sortOrder } = getPaginationParams(query);

  const where: Prisma.AttendanceWhereInput = {
    ...(query.date       && { date: new Date(query.date) }),
    ...(query.employeeId && { employeeId: query.employeeId }),
    ...(query.departmentId && {
      employee: { departmentId: query.departmentId },
    }),
  };

  const [raw, total] = await Promise.all([
    prisma.attendance.findMany({
      where, skip, take: limit,
      orderBy: { date: sortOrder as "asc" | "desc" },
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true,
            profileImage: true, designation: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.attendance.count({ where }),
  ]);

  const data = raw.map((a) => {
    const emp = a.employee as { firstName: string; lastName: string; profileImage?: string | null } & typeof a.employee;
    return { ...a, employee: { ...emp, name: `${emp.firstName} ${emp.lastName}`, avatar: emp.profileImage } };
  });

  return { data, meta: buildPaginationMeta(total, page, limit) };
}

export async function getMonthlyAttendance(employeeId: string, month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0);

  return prisma.attendance.findMany({
    where: { employeeId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
}

export async function getAttendanceSummary(employeeId: string, month: number, year: number) {
  const records = await getMonthlyAttendance(employeeId, month, year);
  const totalDays = records.length;

  return {
    present:        records.filter((r) => r.status === "PRESENT").length,
    absent:         records.filter((r) => r.status === "ABSENT").length,
    late:           records.filter((r) => r.status === "LATE").length,
    halfDay:        records.filter((r) => r.status === "HALF_DAY").length,
    totalDays,
    attendanceRate: totalDays > 0
      ? Math.round((records.filter((r) => ["PRESENT","LATE"].includes(r.status)).length / totalDays) * 100)
      : 0,
    totalWorkingHours: records.reduce((s, r) => s + Number(r.workingHours ?? 0), 0),
    totalOvertime:     records.reduce((s, r) => s + Number(r.overtimeHours ?? 0), 0),
  };
}

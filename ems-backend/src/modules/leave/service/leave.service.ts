import prisma from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination";
import { sendEmail, emailTemplates } from "@/lib/resend";
import { createNotification } from "@/services/notification.service";
import { differenceInBusinessDays } from "date-fns";
import type { PaginationQuery } from "@/types";
import type { Prisma } from "@prisma/client";

export async function applyLeave(employeeId: string, data: ApplyLeaveInput) {
  const start = new Date(data.startDate);
  const end   = new Date(data.endDate);
  if (end < start) throw ApiError.badRequest("End date must be after start date");

  const days = differenceInBusinessDays(end, start) + 1;
  if (days <= 0) throw ApiError.badRequest("Invalid leave duration");

  // Check balance
  const balance = await prisma.leaveBalance.findUnique({ where: { employeeId } });
  if (!balance) throw ApiError.notFound("Leave balance not found");

  const typeKey = data.leaveType.toLowerCase() as keyof typeof balance;
  const used    = `${typeKey}Used` as keyof typeof balance;
  const total   = Number(balance[typeKey] ?? 0);
  const usedSoFar = Number(balance[used] ?? 0);

  if (total !== 999 && usedSoFar + days > total) {
    throw ApiError.badRequest(`Insufficient ${data.leaveType} leave balance. Remaining: ${total - usedSoFar} days`);
  }

  // Check overlap
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status:   { in: ["PENDING", "APPROVED"] },
      OR: [
        { startDate: { lte: end   }, endDate: { gte: start } },
      ],
    },
  });
  if (overlap) throw ApiError.conflict("You already have a leave request for these dates");

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId, leaveType: data.leaveType,
      startDate: start, endDate: end, days, reason: data.reason,
    },
    include: { employee: { select: { firstName: true, lastName: true, department: { select: { name: true } } } } },
  });

  // Notify HR/Admin
  const hrUsers = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "HR"] }, isActive: true } });
  await Promise.allSettled(hrUsers.map((u) =>
    createNotification({
      userId:  u.id,
      title:   "New Leave Request",
      message: `${leave.employee.firstName} ${leave.employee.lastName} requested ${data.leaveType} leave`,
      type:    "LEAVE_REQUEST",
      link:    "/leave",
    })
  ));

  return leave;
}

export async function listLeaveRequests(
  query: PaginationQuery & { status?: string; employeeId?: string }
) {
  const { page, limit, skip, sortOrder } = getPaginationParams(query);

  const where: Prisma.LeaveRequestWhereInput = {
    ...(query.status     && { status:     query.status as Prisma.EnumLeaveStatusFilter }),
    ...(query.employeeId && { employeeId: query.employeeId }),
  };

  const [data, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where, skip, take: limit,
      orderBy: { appliedAt: sortOrder },
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
    prisma.leaveRequest.count({ where }),
  ]);

  return { data, meta: buildPaginationMeta(total, page, limit) };
}

export async function approveLeave(id: string, approvedById: string) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { employee: { select: { email: true, firstName: true, lastName: true } } },
  });
  if (!leave) throw ApiError.notFound("Leave request not found");
  if (leave.status !== "PENDING") throw ApiError.badRequest("Leave already processed");

  const typeKey = leave.leaveType.toLowerCase() as string;
  const usedKey = `${typeKey}Used`;

  await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id },
      data:  { status: "APPROVED", approvedById, reviewedAt: new Date() },
    }),
    prisma.leaveBalance.update({
      where: { employeeId: leave.employeeId },
      data:  { [usedKey]: { increment: leave.days } },
    }),
  ]);

  // Notify employee
  const empUser = await prisma.user.findUnique({ where: { employee: { id: leave.employeeId } } });
  if (empUser) {
    await createNotification({
      userId:  empUser.id,
      title:   "Leave Approved ✅",
      message: `Your ${leave.leaveType} leave has been approved`,
      type:    "LEAVE_APPROVED",
      link:    "/leave",
    });
  }

  // Email
  const dates = `${leave.startDate.toDateString()} – ${leave.endDate.toDateString()}`;
  sendEmail({
    to:      leave.employee.email,
    subject: "Your leave has been approved",
    html:    emailTemplates.leaveApproved(`${leave.employee.firstName}`, leave.leaveType, dates),
  }).catch(() => {});

  return leave;
}

export async function rejectLeave(id: string, approvedById: string, reason: string) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: { employee: { select: { email: true, firstName: true } } },
  });
  if (!leave) throw ApiError.notFound("Leave request not found");
  if (leave.status !== "PENDING") throw ApiError.badRequest("Leave already processed");

  await prisma.leaveRequest.update({
    where: { id },
    data:  { status: "REJECTED", approvedById, rejectionReason: reason, reviewedAt: new Date() },
  });

  sendEmail({
    to:      leave.employee.email,
    subject: "Leave Request Update",
    html:    emailTemplates.leaveRejected(leave.employee.firstName, leave.leaveType, reason),
  }).catch(() => {});

  return leave;
}

export async function cancelLeave(id: string, employeeId: string) {
  const leave = await prisma.leaveRequest.findFirst({ where: { id, employeeId } });
  if (!leave) throw ApiError.notFound("Leave request not found");
  if (leave.status !== "PENDING") throw ApiError.badRequest("Only pending requests can be cancelled");

  return prisma.leaveRequest.update({ where: { id }, data: { status: "CANCELLED" } });
}

export async function getLeaveBalance(employeeId: string) {
  const balance = await prisma.leaveBalance.findUnique({ where: { employeeId } });
  if (!balance) throw ApiError.notFound("Leave balance not found");
  return balance;
}

interface ApplyLeaveInput {
  leaveType: string;
  startDate: string;
  endDate:   string;
  reason:    string;
}

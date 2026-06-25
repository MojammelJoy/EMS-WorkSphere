import prisma from "@/lib/prisma";
import { ApiError } from "@/utils/apiError";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination";
import { sendEmail, emailTemplates } from "@/lib/resend";
import { formatCurrency, getMonthName } from "@/utils/helpers";
import { createNotification } from "@/services/notification.service";
import type { PaginationQuery } from "@/types";

export async function listPayroll(
  query: PaginationQuery & { month?: number; year?: number; status?: string }
) {
  const { page, limit, skip } = getPaginationParams(query);

  const where = {
    ...(query.month  && { month: Number(query.month) }),
    ...(query.year   && { year:  Number(query.year) }),
    ...(query.status && { status: query.status as "DRAFT" | "PROCESSED" | "PAID" }),
  };

  const [raw, total] = await Promise.all([
    prisma.payroll.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        employee: {
          select: {
            id: true, firstName: true, lastName: true,
            employeeId: true, designation: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payroll.count({ where }),
  ]);

  const data = raw.map((p) => ({
    ...p,
    employee: { ...p.employee, name: `${p.employee.firstName} ${p.employee.lastName}` },
  }));

  return { data, meta: buildPaginationMeta(total, page, limit) };
}

export async function processMonthlyPayroll(month: number, year: number) {
  const employees = await prisma.employee.findMany({
    where:   { status: "ACTIVE" },
    include: { user: { select: { id: true, email: true } } },
  });

  const results = await Promise.allSettled(
    employees.map((emp) => processEmployeePayroll(emp, month, year))
  );

  return {
    processed: results.filter((r) => r.status === "fulfilled").length,
    failed:    results.filter((r) => r.status === "rejected").length,
    total:     employees.length,
  };
}

async function processEmployeePayroll(
  emp: { id: string; salary: unknown; user: { id: string; email: string }; firstName?: string; lastName?: string } & Record<string, unknown>,
  month: number,
  year:  number
) {
  const basicSalary      = Number(emp.salary);
  const houseRent        = basicSalary * 0.4;
  const medicalAllowance = basicSalary * 0.1;
  const transport        = 5000;

  // Get overtime from attendance
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0);
  const attendance = await prisma.attendance.aggregate({
    where:   { employeeId: emp.id, date: { gte: start, lte: end } },
    _sum:    { overtimeHours: true },
  });

  const overtimeHours  = Number(attendance._sum.overtimeHours ?? 0);
  const overtimeAmount = (basicSalary / 160) * 1.5 * overtimeHours;
  const grossSalary    = basicSalary + houseRent + medicalAllowance + transport + overtimeAmount;

  // Deductions
  const taxRate       = grossSalary > 50000 ? 0.05 : 0;
  const taxDeduction  = grossSalary * taxRate;
  const providentFund = basicSalary * 0.1;
  const totalDeductions = taxDeduction + providentFund;
  const netSalary       = grossSalary - totalDeductions;

  const payroll = await prisma.payroll.upsert({
    where:  { employeeId_month_year: { employeeId: emp.id, month, year } },
    create: {
      employeeId: emp.id, month, year,
      basicSalary, houseRent, medicalAllowance, transport,
      overtimeAmount, grossSalary,
      taxDeduction, providentFund, totalDeductions, netSalary,
      status: "PROCESSED",
    },
    update: {
      basicSalary, houseRent, medicalAllowance, transport,
      overtimeAmount, grossSalary,
      taxDeduction, providentFund, totalDeductions, netSalary,
      status: "PROCESSED",
    },
  });

  // Notify + email
  await createNotification({
    userId:  emp.user.id,
    title:   "Payslip Generated 💰",
    message: `Your payslip for ${getMonthName(month, year)} is ready. Net: ${formatCurrency(netSalary)}`,
    type:    "PAYSLIP_GENERATED",
    link:    "/payroll",
  });

  sendEmail({
    to:      emp.user.email,
    subject: `Payslip for ${getMonthName(month, year)}`,
    html:    emailTemplates.payslipGenerated(
      `${String(emp.firstName ?? "")} ${String(emp.lastName ?? "")}`.trim(),
      getMonthName(month, year),
      formatCurrency(netSalary)
    ),
  }).catch(() => {});

  return payroll;
}

export async function getMyPayslips(userId: string) {
  const employee = await prisma.employee.findUnique({ where: { userId }, select: { id: true } });
  if (!employee) throw ApiError.notFound("Employee not found");

  return prisma.payroll.findMany({
    where:   { employeeId: employee.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}

export async function markAsPaid(id: string) {
  const payroll = await prisma.payroll.findUnique({ where: { id } });
  if (!payroll) throw ApiError.notFound("Payroll record not found");
  if (payroll.status === "PAID") throw ApiError.conflict("Already marked as paid");

  return prisma.payroll.update({
    where: { id },
    data:  { status: "PAID", paidAt: new Date() },
  });
}

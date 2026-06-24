import prisma from "@/lib/prisma";
import { cache } from "@/lib/redis";
import { sendEmail, emailTemplates } from "@/lib/resend";
import { ApiError } from "@/utils/apiError";
import { hashPassword, generateTempPassword, generateEmployeeId } from "@/utils/helpers";
import { getPaginationParams, buildPaginationMeta } from "@/utils/pagination";
import { CACHE_KEYS, CACHE_TTL, LEAVE_DEFAULTS, CLOUDINARY } from "@/constants";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import type { PaginationQuery } from "@/types";
import type { Prisma } from "@prisma/client";

export async function listEmployees(query: PaginationQuery & { departmentId?: string; status?: string }) {
  const { page, limit, skip, search, sortBy, sortOrder } = getPaginationParams(query);

  const where: Prisma.EmployeeWhereInput = {
    ...(search && {
      OR: [
        { firstName:  { contains: search, mode: "insensitive" } },
        { lastName:   { contains: search, mode: "insensitive" } },
        { email:      { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { designation:{ contains: search, mode: "insensitive" } },
      ],
    }),
    ...(query.departmentId && { departmentId: query.departmentId }),
    ...(query.status && { status: query.status as Prisma.EnumEmployeeStatusFilter }),
  };

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where, skip, take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        department:      { select: { id: true, name: true } },
        emergencyContact: true,
      },
    }),
    prisma.employee.count({ where }),
  ]);

  const mapped = data.map((e) => ({ ...e, name: `${e.firstName} ${e.lastName}`, avatar: e.profileImage }));
  return { data: mapped, meta: buildPaginationMeta(total, page, limit) };
}

export async function getEmployeeById(id: string) {
  const cached = await cache.get(CACHE_KEYS.EMPLOYEE(id));
  if (cached) return cached;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department:      { select: { id: true, name: true, code: true } },
      emergencyContact: true,
      user:            { select: { email: true, role: true, lastLoginAt: true } },
    },
  });
  if (!employee) throw ApiError.notFound("Employee not found");

  const result = { ...employee, name: `${employee.firstName} ${employee.lastName}`, avatar: employee.profileImage };
  await cache.set(CACHE_KEYS.EMPLOYEE(id), result, CACHE_TTL.MEDIUM);
  return result;
}

export async function createEmployee(data: CreateEmployeeInput, creatorId: string) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw ApiError.conflict("Email already registered");

  const dept = await prisma.department.findUnique({ where: { id: data.departmentId } });
  if (!dept) throw ApiError.notFound("Department not found");

  const count = await prisma.employee.count();
  const employeeId = generateEmployeeId(count);
  const tempPassword = generateTempPassword();
  const hashedPw = await hashPassword(tempPassword);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: data.email, password: hashedPw, role: "EMPLOYEE" },
    });

    const employee = await tx.employee.create({
      data: {
        employeeId,
        userId:         user.id,
        firstName:      data.firstName,
        lastName:       data.lastName,
        email:          data.email,
        phone:          data.phone,
        gender:         data.gender,
        dateOfBirth:    data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address:        data.address,
        nid:            data.nid,
        bloodGroup:     data.bloodGroup,
        designation:    data.designation,
        departmentId:   data.departmentId,
        managerId:      data.managerId,
        joiningDate:    new Date(data.joiningDate),
        employmentType: data.employmentType ?? "FULL_TIME",
        salary:         data.salary,
      },
      include: { department: { select: { id: true, name: true } } },
    });

    if (data.emergencyContact) {
      await tx.emergencyContact.create({
        data: { employeeId: employee.id, ...data.emergencyContact },
      });
    }

    await tx.leaveBalance.create({
      data: {
        employeeId: employee.id,
        year:       new Date().getFullYear(),
        ...LEAVE_DEFAULTS,
      },
    });

    return employee;
  });

  // Send welcome email async
  sendEmail({
    to:      data.email,
    subject: "Welcome to WorkSphere",
    html:    emailTemplates.welcome(`${data.firstName} ${data.lastName}`, tempPassword),
  }).catch(() => {});

  await cache.delPattern(`${CACHE_KEYS.EMPLOYEES}*`);
  return result;
}

export async function updateEmployee(id: string, data: Partial<CreateEmployeeInput>) {
  await getEmployeeById(id);

  const updated = await prisma.employee.update({
    where: { id },
    data: {
      ...(data.firstName      && { firstName:      data.firstName }),
      ...(data.lastName       && { lastName:        data.lastName }),
      ...(data.phone          && { phone:           data.phone }),
      ...(data.gender         && { gender:          data.gender }),
      ...(data.dateOfBirth    && { dateOfBirth:     new Date(data.dateOfBirth) }),
      ...(data.address        && { address:         data.address }),
      ...(data.nid            && { nid:             data.nid }),
      ...(data.bloodGroup     && { bloodGroup:      data.bloodGroup }),
      ...(data.designation    && { designation:     data.designation }),
      ...(data.departmentId   && { departmentId:    data.departmentId }),
      ...(data.salary         && { salary:          data.salary }),
      ...(data.status         && { status:          data.status }),
      ...(data.employmentType && { employmentType:  data.employmentType }),
    },
    include: { department: { select: { id: true, name: true } } },
  });

  if (data.emergencyContact) {
    await prisma.emergencyContact.upsert({
      where:  { employeeId: id },
      create: { employeeId: id, ...data.emergencyContact },
      update: data.emergencyContact,
    });
  }

  await cache.del(CACHE_KEYS.EMPLOYEE(id));
  await cache.delPattern(`${CACHE_KEYS.EMPLOYEES}*`);
  return updated;
}

export async function deleteEmployee(id: string) {
  await getEmployeeById(id);
  await prisma.employee.delete({ where: { id } });
  await cache.del(CACHE_KEYS.EMPLOYEE(id));
  await cache.delPattern(`${CACHE_KEYS.EMPLOYEES}*`);
}

export async function uploadEmployeeAvatar(id: string, buffer: Buffer) {
  const employee = await getEmployeeById(id) as { cloudinaryId?: string };

  if (employee.cloudinaryId) {
    await deleteFromCloudinary(employee.cloudinaryId).catch(() => {});
  }

  const uploaded = await uploadToCloudinary(buffer, CLOUDINARY.AVATAR_FOLDER, `avatar_${id}`);

  const updated = await prisma.employee.update({
    where: { id },
    data:  { profileImage: uploaded.url, cloudinaryId: uploaded.publicId },
  });

  await cache.del(CACHE_KEYS.EMPLOYEE(id));
  return updated;
}

// ── Types ──
interface CreateEmployeeInput {
  firstName: string; lastName: string; email: string; phone?: string;
  gender: "MALE" | "FEMALE" | "OTHER"; dateOfBirth?: string; address?: string;
  nid?: string; bloodGroup?: string; designation: string; departmentId: string;
  managerId?: string; joiningDate: string;
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
  salary: number; status?: "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "TERMINATED";
  emergencyContact?: { name: string; relation: string; phone: string };
}

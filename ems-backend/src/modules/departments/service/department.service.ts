import prisma from "@/lib/prisma";
import { cache } from "@/lib/redis";
import { ApiError } from "@/utils/apiError";
import { CACHE_KEYS, CACHE_TTL } from "@/constants";

export async function listDepartments() {
  const cached = await cache.get(CACHE_KEYS.DEPARTMENTS);
  if (cached) return cached;

  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  const mapped = departments.map(({ _count, ...d }) => ({ ...d, employeeCount: _count.employees }));
  await cache.set(CACHE_KEYS.DEPARTMENTS, mapped, CACHE_TTL.MEDIUM);
  return mapped;
}

export async function createDepartment(data: { name: string; code: string; description?: string }) {
  const department = await prisma.department.create({ data });
  await cache.del(CACHE_KEYS.DEPARTMENTS);
  return department;
}

export async function updateDepartment(id: string, data: { name?: string; description?: string }) {
  const exists = await prisma.department.findUnique({ where: { id } });
  if (!exists) throw ApiError.notFound("Department not found");

  const updated = await prisma.department.update({ where: { id }, data });
  await cache.del(CACHE_KEYS.DEPARTMENTS, CACHE_KEYS.DEPARTMENT(id));
  return updated;
}

export async function deleteDepartment(id: string) {
  const count = await prisma.employee.count({ where: { departmentId: id } });
  if (count > 0) throw ApiError.badRequest("Cannot delete department with active employees");

  await prisma.department.update({ where: { id }, data: { isActive: false } });
  await cache.del(CACHE_KEYS.DEPARTMENTS, CACHE_KEYS.DEPARTMENT(id));
}

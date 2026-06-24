import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱  Seeding database…");

  /* ── Departments ── */
  const depts = await Promise.all([
    prisma.department.upsert({ where: { code: "ENG"  }, update: {}, create: { name: "Engineering",  code: "ENG",  description: "Product engineering and platform." } }),
    prisma.department.upsert({ where: { code: "SAL"  }, update: {}, create: { name: "Sales",        code: "SAL",  description: "Business development." } }),
    prisma.department.upsert({ where: { code: "MKT"  }, update: {}, create: { name: "Marketing",    code: "MKT",  description: "Brand strategy and growth." } }),
    prisma.department.upsert({ where: { code: "FIN"  }, update: {}, create: { name: "Finance",      code: "FIN",  description: "Financial operations." } }),
    prisma.department.upsert({ where: { code: "HR"   }, update: {}, create: { name: "HR & Admin",   code: "HR",   description: "Human resources." } }),
    prisma.department.upsert({ where: { code: "OPS"  }, update: {}, create: { name: "Operations",   code: "OPS",  description: "Business operations." } }),
  ]);
  console.log(`✅  ${depts.length} departments seeded`);

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  /* ── Admin User ── */
  const adminExists = await prisma.user.findUnique({ where: { email: "admin@company.com" } });
  if (!adminExists) {
    const adminUser = await prisma.user.create({
      data: {
        email:           "admin@company.com",
        password:        await hash("password123"),
        role:            "ADMIN",
        isEmailVerified: true,
      },
    });
    await prisma.employee.create({
      data: {
        employeeId:   "EMP-0001",
        userId:       adminUser.id,
        firstName:    "System",
        lastName:     "Administrator",
        email:        "admin@company.com",
        gender:       "MALE",
        designation:  "System Administrator",
        departmentId: depts[4].id,
        joiningDate:  new Date("2020-01-01"),
        salary:       150000,
        status:       "ACTIVE",
      },
    });
    console.log("✅  Admin user seeded (admin@company.com / password123)");
  }

  /* ── HR User ── */
  const hrExists = await prisma.user.findUnique({ where: { email: "hr@company.com" } });
  if (!hrExists) {
    const hrUser = await prisma.user.create({
      data: {
        email:           "hr@company.com",
        password:        await hash("password123"),
        role:            "HR",
        isEmailVerified: true,
      },
    });
    await prisma.employee.create({
      data: {
        employeeId:   "EMP-0002",
        userId:       hrUser.id,
        firstName:    "Tasnim",
        lastName:     "Jahan",
        email:        "hr@company.com",
        gender:       "FEMALE",
        designation:  "HR Manager",
        departmentId: depts[4].id,
        joiningDate:  new Date("2021-03-15"),
        salary:       85000,
        status:       "ACTIVE",
      },
    });
    console.log("✅  HR user seeded (hr@company.com / password123)");
  }

  /* ── Sample Employee ── */
  const empExists = await prisma.user.findUnique({ where: { email: "emp@company.com" } });
  if (!empExists) {
    const empUser = await prisma.user.create({
      data: {
        email:           "emp@company.com",
        password:        await hash("password123"),
        role:            "EMPLOYEE",
        isEmailVerified: true,
      },
    });
    const emp = await prisma.employee.create({
      data: {
        employeeId:   "EMP-0003",
        userId:       empUser.id,
        firstName:    "Rakibul",
        lastName:     "Hasan",
        email:        "emp@company.com",
        gender:       "MALE",
        designation:  "Backend Engineer",
        departmentId: depts[0].id,
        joiningDate:  new Date("2023-01-04"),
        salary:       86500,
        status:       "ACTIVE",
        dateOfBirth:  new Date("1996-06-25"),
      },
    });
    await prisma.leaveBalance.create({
      data: {
        employeeId: emp.id,
        year:       new Date().getFullYear(),
        casual:     12, sick: 14, earned: 20,
        maternity: 90, paternity: 10, unpaid: 999, compensatory: 0,
      },
    });
    console.log("✅  Sample employee seeded (emp@company.com / password123)");
  }

  console.log("🎉  Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

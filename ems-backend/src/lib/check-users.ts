import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isActive: true, password: true },
  });

  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    const match = await bcrypt.compare("password123", u.password);
    console.log(`  ${u.email} | role=${u.role} | isActive=${u.isActive} | password match=${match}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

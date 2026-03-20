import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "shopintel-salt-2026").digest("hex");
}

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@growthcapital.com" },
    update: {},
    create: {
      email: "admin@growthcapital.com",
      password: hashPassword("growth2026"),
      name: "Growth Capital",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "client@glowpure.com" },
    update: {},
    create: {
      email: "client@glowpure.com",
      password: hashPassword("glowpure2026"),
      name: "GlowPure",
      role: "client",
    },
  });

  console.log("Seeded: admin@growthcapital.com / growth2026, client@glowpure.com / glowpure2026");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

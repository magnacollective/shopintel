import { createHash } from "crypto";

function hashPassword(password) {
  return createHash("sha256").update(password + "shopintel-salt-2026").digest("hex");
}

// Use dynamic import for the generated client
const { PrismaClient } = await import("../src/generated/prisma/client.js");
const prisma = new PrismaClient();

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
await prisma.$disconnect();

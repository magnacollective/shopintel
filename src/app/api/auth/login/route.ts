import { prisma } from "@/lib/db";
import { verifyPassword, hashPassword, createSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Legacy SHA256 check for migration from old hashing
function legacySha256Hash(password: string): string {
  return createHash("sha256")
    .update(password + "shopintel-salt-2026")
    .digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json();

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password format" }, { status: 400 });
  }

  const { email, password } = parsed.data;

  // Rate limiting by email
  const now = Date.now();
  const attempts = loginAttempts.get(email);
  if (attempts && attempts.count >= MAX_ATTEMPTS && now - attempts.lastAttempt < LOCKOUT_MS) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const current = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    loginAttempts.set(email, { count: current.count + 1, lastAttempt: now });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Try bcrypt first, then fall back to legacy SHA256 for migration
  let isValid = false;
  const isBcryptHash = user.password.startsWith("$2");

  if (isBcryptHash) {
    isValid = await verifyPassword(password, user.password);
  } else {
    // Legacy SHA256 hash — verify and auto-upgrade to bcrypt
    isValid = user.password === legacySha256Hash(password);
    if (isValid) {
      const bcryptHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: bcryptHash },
      });
    }
  }

  if (!isValid) {
    const current = loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
    loginAttempts.set(email, { count: current.count + 1, lastAttempt: now });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Reset attempts on successful login
  loginAttempts.delete(email);

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as "admin" | "client",
  });

  return NextResponse.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

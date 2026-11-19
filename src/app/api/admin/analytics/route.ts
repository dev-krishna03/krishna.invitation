import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const thirtyAgo = new Date();
  thirtyAgo.setDate(thirtyAgo.getDate() - 30);

  const payments = await prisma.payment.findMany({
    where: { status: "SUCCESS", created_at: { gte: twelveMonthsAgo } },
    select: { amount: true, created_at: true },
  });
  const revByMonth: Record<string, number> = {};
  for (const p of payments) {
    const k = `${p.created_at.getFullYear()}-${String(p.created_at.getMonth() + 1).padStart(2, "0")}`;
    revByMonth[k] = (revByMonth[k] ?? 0) + p.amount;
  }

  const signups = await prisma.user.findMany({
    where: { created_at: { gte: thirtyAgo } },
    select: { created_at: true },
  });
  const signupsByDay: Record<string, number> = {};
  for (const u of signups) {
    const k = u.created_at.toISOString().slice(0, 10);
    signupsByDay[k] = (signupsByDay[k] ?? 0) + 1;
  }

  return NextResponse.json({ revByMonth, signupsByDay });
}

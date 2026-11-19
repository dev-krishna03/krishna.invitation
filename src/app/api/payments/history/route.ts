import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const payments = await prisma.payment.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
    take: 100,
  });
  return NextResponse.json({ payments });
}

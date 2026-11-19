import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { Gateway, PaymentStatus } from "@prisma/client";

export async function GET(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const url = new URL(req.url);
  const gateway = url.searchParams.get("gateway");
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const payments = await prisma.payment.findMany({
    where: {
      gateway: gateway ? (gateway as Gateway) : undefined,
      status: status ? (status as PaymentStatus) : undefined,
      created_at: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined,
    },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { created_at: "desc" },
    take: 500,
  });
  return NextResponse.json({ payments });
}

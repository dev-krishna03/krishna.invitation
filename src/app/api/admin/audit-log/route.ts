import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const url = new URL(req.url);
  const actor = url.searchParams.get("actor");
  const action = url.searchParams.get("action");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const logs = await prisma.auditLog.findMany({
    where: {
      actor_id: actor ?? undefined,
      action: action ?? undefined,
      created_at: from || to ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined,
    },
    include: { actor: { select: { email: true, name: true } } },
    orderBy: { created_at: "desc" },
    take: 500,
  });
  return NextResponse.json({ logs });
}

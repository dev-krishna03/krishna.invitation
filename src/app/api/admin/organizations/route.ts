import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const orgs = await prisma.organization.findMany({
    include: { _count: { select: { members: true, invitations: true } }, subscriptions: { include: { plan: true } } },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ organizations: orgs });
}

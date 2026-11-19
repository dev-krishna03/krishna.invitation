import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const before = await prisma.subscriptionPlan.findUnique({ where: { id } });
  const plan = await prisma.subscriptionPlan.update({ where: { id }, data: body });
  await logAudit({ actorId: g.id, action: "plan.update", entityType: "SubscriptionPlan", entityId: id, oldValue: before, newValue: plan });
  return NextResponse.json({ plan });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const before = await prisma.subscriptionPlan.findUnique({ where: { id } });
  await prisma.subscriptionPlan.delete({ where: { id } });
  await logAudit({ actorId: g.id, action: "plan.delete", entityType: "SubscriptionPlan", entityId: id, oldValue: before });
  return NextResponse.json({ ok: true });
}

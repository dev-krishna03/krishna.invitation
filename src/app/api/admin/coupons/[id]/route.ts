import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const before = await prisma.coupon.findUnique({ where: { id } });
  const c = await prisma.coupon.update({ where: { id }, data: body });
  await logAudit({ actorId: g.id, action: "coupon.update", entityType: "Coupon", entityId: id, oldValue: before, newValue: c });
  return NextResponse.json({ coupon: c });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const before = await prisma.coupon.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.coupon.delete({ where: { id } });
  await logAudit({ actorId: g.id, action: "coupon.delete", entityType: "Coupon", entityId: id, oldValue: before });
  return NextResponse.json({ ok: true });
}

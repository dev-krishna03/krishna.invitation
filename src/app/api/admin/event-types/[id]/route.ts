import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  name: z.string().min(1).optional(),
  icon: z.string().max(32).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.eventTypeConfig.findUnique({ where: { id } });
  const et = await prisma.eventTypeConfig.update({ where: { id }, data: parsed.data });
  await logAudit({ actorId: g.id, action: "event_type.update", entityType: "EventTypeConfig", entityId: id, oldValue: before, newValue: et });
  return NextResponse.json({ eventType: et });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const before = await prisma.eventTypeConfig.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const inUse = await prisma.invitation.count({ where: { event_type: before.slug } });
  if (inUse > 0) {
    // Soft-deactivate instead of hard delete when the slug is in use.
    await prisma.eventTypeConfig.update({ where: { id }, data: { is_active: false } });
    await logAudit({ actorId: g.id, action: "event_type.deactivate", entityType: "EventTypeConfig", entityId: id, oldValue: before });
    return NextResponse.json({ ok: true, deactivated: true, inUse });
  }
  await prisma.eventTypeConfig.delete({ where: { id } });
  await logAudit({ actorId: g.id, action: "event_type.delete", entityType: "EventTypeConfig", entityId: id, oldValue: before });
  return NextResponse.json({ ok: true });
}

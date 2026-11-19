import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
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
  const before = await prisma.template.findUnique({ where: { id } });
  const t = await prisma.template.update({ where: { id }, data: parsed.data });
  await logAudit({ actorId: g.id, action: "template.update", entityType: "Template", entityId: id, oldValue: before, newValue: t });
  return NextResponse.json({ template: t });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const before = await prisma.template.findUnique({ where: { id } });
  await prisma.template.delete({ where: { id } });
  await logAudit({ actorId: g.id, action: "template.delete", entityType: "Template", entityId: id, oldValue: before });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { ElementKind, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  name: z.string().optional(),
  kind: z.nativeEnum(ElementKind).optional(),
  category: z.string().optional(),
  icon: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  default_props: z.record(z.string(), z.unknown()).optional(),
  is_pro_only: z.boolean().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.templateElement.findUnique({ where: { id } });
  const { default_props, ...rest } = parsed.data;
  const el = await prisma.templateElement.update({
    where: { id },
    data: {
      ...rest,
      ...(default_props !== undefined ? { default_props: default_props as Prisma.InputJsonValue } : {}),
    },
  });
  await logAudit({
    actorId: guard.id,
    action: "element.update",
    entityType: "TemplateElement",
    entityId: id,
    oldValue: before,
    newValue: el,
  });
  return NextResponse.json({ element: el });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  const before = await prisma.templateElement.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.templateElement.delete({ where: { id } });
  await logAudit({ actorId: guard.id, action: "element.delete", entityType: "TemplateElement", entityId: id, oldValue: before });
  return NextResponse.json({ ok: true });
}

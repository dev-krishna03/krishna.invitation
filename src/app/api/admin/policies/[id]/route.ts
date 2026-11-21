import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  title: z.string().min(1).optional(),
  summary: z.string().nullable().optional(),
  content: z.string().optional(),
  version: z.string().optional(),
  is_published: z.boolean().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.policy.findUnique({ where: { id } });
  const updated = await prisma.policy.update({
    where: { id },
    data: { ...parsed.data, updated_by_id: guard.id },
  });
  await logAudit({
    actorId: guard.id,
    action: "policy.update",
    entityType: "Policy",
    entityId: id,
    oldValue: { title: before?.title, version: before?.version, is_published: before?.is_published },
    newValue: { title: updated.title, version: updated.version, is_published: updated.is_published },
  });
  return NextResponse.json({ policy: updated });
}

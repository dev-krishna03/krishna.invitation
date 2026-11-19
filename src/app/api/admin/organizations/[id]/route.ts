import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { SubscriptionStatus } from "@prisma/client";

const Patch = z.object({
  name: z.string().optional(),
  slug: z.string().optional(),
  is_active: z.boolean().optional(),
  subscription_status: z.nativeEnum(SubscriptionStatus).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.organization.findUnique({ where: { id } });
  const org = await prisma.organization.update({ where: { id }, data: parsed.data });
  await logAudit({ actorId: g.id, action: "org.update", entityType: "Organization", entityId: id, oldValue: before, newValue: org });
  return NextResponse.json({ organization: org });
}

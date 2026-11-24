import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  name: z.string().optional(),
  tagline: z.string().nullable().optional(),
  monthly_price: z.number().int().nonnegative().optional(),
  yearly_price: z.number().int().nonnegative().optional(),
  platform_fee_pct: z.number().int().min(0).max(100).optional(),
  max_templates_free: z.number().int().nullable().optional(),
  extra_template_price: z.number().int().nonnegative().optional(),
  max_templates_for_sale: z.number().int().nullable().optional(),
  max_live_invitations: z.number().int().nullable().optional(),
  can_sell: z.boolean().optional(),
  white_label: z.boolean().optional(),
  is_active: z.boolean().optional(),
  features: z.array(z.string()).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.creatorPlan.findUnique({ where: { id } });
  const updated = await prisma.creatorPlan.update({ where: { id }, data: parsed.data });
  await logAudit({
    actorId: guard.id,
    action: "creator_plan.update",
    entityType: "CreatorPlan",
    entityId: id,
    oldValue: before,
    newValue: updated,
  });
  return NextResponse.json({ plan: updated });
}

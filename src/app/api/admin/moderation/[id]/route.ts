import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Body = z.object({
  decision: z.enum(["APPROVED", "REJECTED", "TAKEN_DOWN"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const template = await prisma.template.findUnique({ where: { id } });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.template.update({
    where: { id },
    data: {
      moderation_status: parsed.data.decision,
      moderation_notes: parsed.data.notes ?? null,
      reviewed_at: new Date(),
      reviewed_by_id: guard.id,
      // A rejection or takedown must also delist the template from the
      // marketplace; approvals leave the owner's listing choice intact.
      is_in_marketplace:
        parsed.data.decision === "APPROVED" ? template.is_in_marketplace : false,
    },
  });

  await logAudit({
    actorId: guard.id,
    action: `template.${parsed.data.decision.toLowerCase()}`,
    entityType: "Template",
    entityId: id,
    oldValue: { status: template.moderation_status },
    newValue: { status: updated.moderation_status, notes: parsed.data.notes ?? null },
  });

  return NextResponse.json({ ok: true, template: updated });
}

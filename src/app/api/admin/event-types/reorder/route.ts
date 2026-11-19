import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Body = z.object({
  order: z.array(z.string().uuid()).min(1),
});

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  await prisma.$transaction(
    parsed.data.order.map((id, idx) =>
      prisma.eventTypeConfig.update({ where: { id }, data: { sort_order: idx } }),
    ),
  );
  await logAudit({ actorId: g.id, action: "event_type.reorder", entityType: "EventTypeConfig", newValue: parsed.data.order });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const CreateHistorySchema = z.object({
  entity_type: z.enum(["TEMPLATE", "INVITATION"]),
  entity_id: z.string().uuid(),
  action: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  snapshot: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function GET(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");

  if (!entityType || !entityId) {
    return NextResponse.json({ error: "entityType and entityId are required" }, { status: 400 });
  }

  const logs = await prisma.activityHistory.findMany({
    where: {
      entity_type: entityType,
      entity_id: entityId,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { created_at: "desc" },
    take: 30,
  });

  return NextResponse.json({ logs });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateHistorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  // Get current version count for this entity
  const count = await prisma.activityHistory.count({
    where: {
      entity_type: parsed.data.entity_type,
      entity_id: parsed.data.entity_id,
    },
  });

  const entry = await prisma.activityHistory.create({
    data: {
      entity_type: parsed.data.entity_type,
      entity_id: parsed.data.entity_id,
      user_id: user.id,
      action: parsed.data.action,
      title: parsed.data.title,
      description: parsed.data.description || null,
      snapshot: parsed.data.snapshot ? (parsed.data.snapshot as any) : undefined,
      version_num: count + 1,
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({ ok: true, entry });
}

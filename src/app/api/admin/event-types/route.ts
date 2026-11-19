import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { slugify } from "@/lib/slug";

const Create = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  icon: z.string().max(32).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const eventTypes = await prisma.eventTypeConfig.findMany({
    orderBy: [{ sort_order: "asc" }],
  });
  return NextResponse.json({ eventTypes });
}

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const parsed = Create.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const exists = await prisma.eventTypeConfig.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });

  const maxOrder = await prisma.eventTypeConfig.aggregate({ _max: { sort_order: true } });
  const et = await prisma.eventTypeConfig.create({
    data: {
      slug,
      name: parsed.data.name,
      icon: parsed.data.icon ?? null,
      parent_id: parsed.data.parent_id ?? null,
      is_active: parsed.data.is_active,
      is_featured: parsed.data.is_featured,
      sort_order: parsed.data.sort_order || (maxOrder._max.sort_order ?? 0) + 1,
    },
  });
  await logAudit({ actorId: g.id, action: "event_type.create", entityType: "EventTypeConfig", entityId: et.id, newValue: et });
  return NextResponse.json({ eventType: et });
}

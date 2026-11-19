import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { TemplateCategory } from "@prisma/client";

const Create = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  preview_url: z.string().optional(),
  category: z.nativeEnum(TemplateCategory),
  event_types: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
  pricing: z
    .array(
      z.object({
        duration_days: z.number().int(),
        price: z.number().int(),
        currency: z.string().default("INR"),
      })
    )
    .default([]),
});

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const templates = await prisma.template.findMany({
    include: { pricing: true },
    orderBy: { sort_order: "asc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const parsed = Create.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid form data", issues: parsed.error.issues }, { status: 400 });
  }
  const { pricing, ...rest } = parsed.data;
  const t = await prisma.template.create({
    data: { ...rest, pricing: { create: pricing } },
  });
  await logAudit({
    actorId: g.id,
    action: "template.create",
    entityType: "Template",
    entityId: t.id,
    newValue: parsed.data,
  });
  return NextResponse.json({ template: t });
}

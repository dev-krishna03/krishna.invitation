import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { CreatorPlanTier } from "@prisma/client";

const CreatePlanSchema = z.object({
  name: z.string().min(2, "Plan name is required"),
  slug: z.string().min(2, "Slug is required"),
  tier: z.nativeEnum(CreatorPlanTier),
  tagline: z.string().nullable().optional(),
  monthly_price: z.number().int().nonnegative().default(0),
  yearly_price: z.number().int().nonnegative().default(0),
  currency: z.string().default("INR"),
  platform_fee_pct: z.number().int().min(0).max(100).default(0),
  max_templates_free: z.number().int().nullable().optional(),
  extra_template_price: z.number().int().nonnegative().default(99),
  max_templates_for_sale: z.number().int().nullable().optional(),
  max_live_invitations: z.number().int().nullable().optional(),
  can_sell: z.boolean().default(true),
  can_import_community: z.boolean().default(true),
  white_label: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const plans = await prisma.creatorPlan.findMany({
    orderBy: { sort_order: "asc" },
  });
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => ({}));
  const parsed = CreatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Check unique slug
  const existing = await prisma.creatorPlan.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Plan slug '${parsed.data.slug}' already exists. Please choose a different slug.` },
      { status: 400 },
    );
  }

  const newPlan = await prisma.creatorPlan.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      tier: parsed.data.tier,
      tagline: parsed.data.tagline,
      monthly_price: parsed.data.monthly_price,
      yearly_price: parsed.data.yearly_price,
      currency: parsed.data.currency,
      platform_fee_pct: parsed.data.platform_fee_pct,
      max_templates_free: parsed.data.max_templates_free,
      extra_template_price: parsed.data.extra_template_price,
      max_templates_for_sale: parsed.data.max_templates_for_sale,
      max_live_invitations: parsed.data.max_live_invitations,
      can_sell: parsed.data.can_sell,
      can_import_community: parsed.data.can_import_community,
      white_label: parsed.data.white_label,
      features: parsed.data.features,
      is_active: parsed.data.is_active,
      sort_order: parsed.data.sort_order,
    },
  });

  await logAudit({
    actorId: guard.id,
    action: "creator_plan.create",
    entityType: "CreatorPlan",
    entityId: newPlan.id,
    newValue: newPlan,
  });

  return NextResponse.json({ ok: true, plan: newPlan });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { BillingPeriod, PlanType, Prisma } from "@prisma/client";

const Create = z.object({
  name: z.string(),
  slug: z.string(),
  type: z.nativeEnum(PlanType),
  price: z.number().int(),
  currency: z.string().default("INR"),
  billing_period: z.nativeEnum(BillingPeriod),
  max_members: z.number().int().nullable().optional(),
  max_invitations: z.number().int().nullable().optional(),
  features: z.any().default([]),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { sort_order: "asc" } });
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const parsed = Create.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const plan = await prisma.subscriptionPlan.create({
    data: { ...parsed.data, features: parsed.data.features as Prisma.InputJsonValue },
  });
  await logAudit({ actorId: g.id, action: "plan.create", entityType: "SubscriptionPlan", entityId: plan.id, newValue: plan });
  return NextResponse.json({ plan });
}

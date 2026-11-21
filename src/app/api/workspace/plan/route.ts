import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { CreatorPlanTier, BillingPeriod } from "@prisma/client";

const Body = z.object({
  tier: z.nativeEnum(CreatorPlanTier),
  billing: z.nativeEnum(BillingPeriod).default(BillingPeriod.MONTHLY),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const plan = await prisma.creatorPlan.findUnique({ where: { tier: parsed.data.tier } });
  if (!plan || !plan.is_active) return NextResponse.json({ error: "Plan not available" }, { status: 404 });

  const now = new Date();
  const periodEnd = new Date(now);
  if (parsed.data.billing === BillingPeriod.YEARLY) periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  else periodEnd.setMonth(periodEnd.getMonth() + 1);

  const subscription = await prisma.userCreatorSubscription.upsert({
    where: { user_id: user.id },
    update: {
      plan_id: plan.id,
      billing: parsed.data.billing,
      period_start: now,
      period_end: periodEnd,
      status: "ACTIVE",
    },
    create: {
      user_id: user.id,
      plan_id: plan.id,
      billing: parsed.data.billing,
      period_start: now,
      period_end: periodEnd,
    },
  });

  // Note: Real payment collection would go through /api/payments/create-order
  // before this route in production. For now the plan change is immediate so
  // workspace limits unlock without extra setup for the demo.

  return NextResponse.json({ subscription, plan });
}

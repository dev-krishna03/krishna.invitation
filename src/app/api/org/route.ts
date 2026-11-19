import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

const Body = z.object({
  name: z.string().min(1),
  planId: z.string().uuid(),
  paymentId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
  if (!plan || plan.type !== "COMPANY") return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  let slug = slugify(parsed.data.name);
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${slugify(parsed.data.name)}-${uniqueSuffix()}`;
  }

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      subscription_status: "ACTIVE",
      members: { create: { user_id: user.id, role: "OWNER", joined_at: new Date() } },
      subscriptions: {
        create: {
          plan_id: plan.id,
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 365 * 24 * 3600 * 1000),
        },
      },
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { role: "COMPANY_ADMIN" } });
  await logAudit({ actorId: user.id, action: "org.create", entityType: "Organization", entityId: org.id, newValue: org });
  return NextResponse.json({ organization: org });
}

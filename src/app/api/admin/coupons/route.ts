import { NextResponse } from "next/server";
import { z } from "zod";
import { CouponType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Create = z.object({
  code: z.string(),
  type: z.nativeEnum(CouponType),
  value: z.number().int(),
  max_uses: z.number().int().optional(),
  min_amount: z.number().int().optional(),
  valid_from: z.coerce.date().optional(),
  valid_until: z.coerce.date().optional(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const coupons = await prisma.coupon.findMany({ orderBy: { created_at: "desc" } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const parsed = Create.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const c = await prisma.coupon.create({ data: parsed.data });
  await logAudit({ actorId: g.id, action: "coupon.create", entityType: "Coupon", entityId: c.id, newValue: c });
  return NextResponse.json({ coupon: c });
}

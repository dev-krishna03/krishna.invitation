import { NextResponse } from "next/server";
import { z } from "zod";
import { CouponType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const CreateAdvancedCouponSchema = z.object({
  code: z
    .string()
    .min(3)
    .max(25)
    .transform((val) => val.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "")),
  name: z.string().optional().nullable(),
  type: z.nativeEnum(CouponType),
  value: z.number().int().positive(),
  max_uses: z.number().int().positive().optional().nullable(),
  max_uses_per_user: z.number().int().positive().optional().nullable(),
  min_amount: z.number().int().nonnegative().optional().nullable(),
  max_discount_amount: z.number().int().positive().optional().nullable(),
  first_time_only: z.boolean().default(false),
  allowed_user_emails: z.array(z.string().email()).default([]),
  allowed_days_of_week: z.array(z.number().min(0).max(6)).default([]),
  time_start: z.string().optional().nullable(),
  time_end: z.string().optional().nullable(),
  scope: z
    .enum(["ALL", "ADMIN_TEMPLATES", "CREATOR_TEMPLATES", "SPECIFIC_TEMPLATE", "CATEGORY"])
    .default("ALL"),
  category_filter: z.string().optional().nullable(),
  template_id: z.string().uuid().optional().nullable(),
  valid_from: z.coerce.date().optional().nullable(),
  valid_until: z.coerce.date().optional().nullable(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;

  const coupons = await prisma.coupon.findMany({
    include: {
      creator: { select: { id: true, name: true, email: true } },
      template: { select: { id: true, name: true, price: true, category: true } },
      _count: { select: { payments: true } },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;

  const parsed = CreateAdvancedCouponSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid coupon data", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const existing = await prisma.coupon.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Coupon code '${parsed.data.code}' already exists.` },
      { status: 409 },
    );
  }

  const data = parsed.data;

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code,
      name: data.name || null,
      type: data.type,
      value: data.value,
      max_uses: data.max_uses || null,
      max_uses_per_user: data.max_uses_per_user || 1,
      min_amount: data.min_amount || null,
      max_discount_amount: data.max_discount_amount || null,
      first_time_only: data.first_time_only,
      allowed_user_emails: data.allowed_user_emails,
      allowed_days_of_week: data.allowed_days_of_week,
      time_start: data.time_start || null,
      time_end: data.time_end || null,
      scope: data.scope,
      category_filter: data.category_filter || null,
      template_id: data.template_id || null,
      creator_user_id: null, // Super admin owned coupon
      valid_from: data.valid_from || null,
      valid_until: data.valid_until || null,
      is_active: data.is_active,
    },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      template: { select: { id: true, name: true, price: true } },
    },
  });

  await logAudit({
    actorId: g.id,
    action: "coupon.create",
    entityType: "Coupon",
    entityId: coupon.id,
    newValue: coupon,
  });

  return NextResponse.json({ coupon, ok: true });
}

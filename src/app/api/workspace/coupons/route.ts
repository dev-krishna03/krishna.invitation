import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { CouponType } from "@prisma/client";

const CreateCouponSchema = z.object({
  code: z
    .string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(25, "Coupon code must be at most 25 characters")
    .transform((val) => val.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, "")),
  name: z.string().optional().nullable(),
  type: z.nativeEnum(CouponType).default(CouponType.PERCENTAGE),
  value: z.number().int().positive("Discount value must be greater than 0"),
  template_id: z.string().uuid().optional().nullable(),
  max_uses: z.number().int().positive().optional().nullable(),
  max_uses_per_user: z.number().int().positive().default(1),
  min_amount: z.number().int().nonnegative().optional().nullable(),
  max_discount_amount: z.number().int().positive().optional().nullable(),
  first_time_only: z.boolean().default(false),
  allowed_days_of_week: z.array(z.number().min(0).max(6)).default([]),
  valid_from: z.string().datetime().optional().nullable(),
  valid_until: z.string().datetime().optional().nullable(),
});

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const coupons = await prisma.coupon.findMany({
    where: { creator_user_id: user.id },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => ({}));
  const parsed = CreateCouponSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Percentage discount cannot exceed 90%
  if (data.type === CouponType.PERCENTAGE && data.value > 90) {
    return NextResponse.json(
      { error: "Percentage discount cannot exceed 90%" },
      { status: 400 },
    );
  }

  // If a template is specified, ensure it belongs to this creator
  if (data.template_id) {
    const template = await prisma.template.findFirst({
      where: { id: data.template_id, owner_user_id: user.id },
    });
    if (!template) {
      return NextResponse.json(
        { error: "Template not found or does not belong to you" },
        { status: 403 },
      );
    }
  }

  // Check if coupon code already exists
  const existing = await prisma.coupon.findUnique({
    where: { code: data.code },
  });
  if (existing) {
    return NextResponse.json(
      { error: `Coupon code '${data.code}' is already taken. Please choose another code.` },
      { status: 409 },
    );
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: data.code,
      name: data.name || null,
      type: data.type,
      value: data.value,
      creator_user_id: user.id,
      template_id: data.template_id || null,
      scope: data.template_id ? "SPECIFIC_TEMPLATE" : "CREATOR_TEMPLATES",
      max_uses: data.max_uses || null,
      max_uses_per_user: data.max_uses_per_user || 1,
      min_amount: data.min_amount || null,
      max_discount_amount: data.max_discount_amount || null,
      first_time_only: data.first_time_only,
      allowed_days_of_week: data.allowed_days_of_week,
      valid_from: data.valid_from ? new Date(data.valid_from) : null,
      valid_until: data.valid_until ? new Date(data.valid_until) : null,
      is_active: true,
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          price: true,
        },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    coupon,
    message: `Coupon ${coupon.code} created successfully.`,
  });
}

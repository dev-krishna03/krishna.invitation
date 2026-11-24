import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { ensureCreatorSubscription } from "@/lib/workspace";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { Gateway, PaymentStatus, TemplateSource, Prisma } from "@prisma/client";
import { getPlatformFeeConfig, computeTemplateSplit } from "@/lib/pricing-calculator";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const body = (await req.json().catch(() => ({}))) as { coupon_code?: string };
  const couponCode = body?.coupon_code ? body.coupon_code.toUpperCase().trim() : undefined;

  const source = await prisma.template.findUnique({ where: { id } });
  if (!source || !source.is_in_marketplace) {
    return NextResponse.json({ error: "Not for sale" }, { status: 404 });
  }
  if (source.owner_user_id === user.id) {
    return NextResponse.json({ error: "You already own this template." }, { status: 400 });
  }

  // Get Super Admin platform fee config
  const feeConfig = await getPlatformFeeConfig();
  let feePct = feeConfig.fee_percentage;

  // If creator has a specific tier plan, check their tier discount if lower
  if (source.owner_user_id) {
    const { plan } = await ensureCreatorSubscription(source.owner_user_id);
    if (plan.platform_fee_pct !== undefined && plan.platform_fee_pct < feePct) {
      feePct = plan.platform_fee_pct;
    }
  }

  const basePrice = source.price ?? 0;
  let discountAmount = 0;
  let appliedCouponId: string | null = null;

  // Process Coupon if provided
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });
    if (coupon && coupon.is_active) {
      const now = new Date();
      const isValidDate = (!coupon.valid_from || coupon.valid_from <= now) && (!coupon.valid_until || coupon.valid_until >= now);
      const hasUses = !coupon.max_uses || coupon.used_count < coupon.max_uses;
      const meetsMin = !coupon.min_amount || basePrice >= coupon.min_amount;
      const matchesTemplate = !coupon.template_id || coupon.template_id === source.id;
      const matchesCreator = !coupon.creator_user_id || coupon.creator_user_id === source.owner_user_id;

      if (isValidDate && hasUses && meetsMin && matchesTemplate && matchesCreator) {
        discountAmount =
          coupon.type === "PERCENTAGE"
            ? Math.round((basePrice * coupon.value) / 100)
            : Math.min(basePrice, coupon.value);
        appliedCouponId = coupon.id;
      }
    }
  }

  // Compute financial split enforcing base price rule (e.g. 500 base, 25% off = 125, host pays 375, admin keeps 10% of 500 = 50, creator receives 325)
  const split = computeTemplateSplit({
    basePrice,
    discountAmount,
    feePercentage: feePct,
    calculateOnBasePrice: feeConfig.calculate_on_base_price,
  });

  const gross = split.hostPayAmount;
  const platformFee = split.platformFee;
  const sellerAmount = split.creatorReceives;

  // Clone the template into the buyer's workspace.
  const base = slugify(source.name);
  let slug = `${base}-${uniqueSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.template.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${uniqueSuffix()}`;
  }

  const copy = await prisma.$transaction(async (tx) => {
    const created = await tx.template.create({
      data: {
        name: `${source.name} (my copy)`,
        slug,
        description: source.description,
        thumbnail_url: source.thumbnail_url,
        category: source.category,
        event_types: source.event_types,
        is_active: true,
        is_featured: false,
        owner_user_id: user.id,
        source: TemplateSource.USER_IMPORTED,
        imported_from_template_id: source.id,
        is_in_marketplace: false,
        price: null,
        currency: source.currency,
      } satisfies Prisma.TemplateUncheckedCreateInput,
    });

    await tx.templatePurchase.create({
      data: {
        template_id: source.id,
        buyer_user_id: user.id,
        gross_amount: gross,
        platform_fee: platformFee,
        seller_amount: sellerAmount,
        currency: source.currency,
        copy_template_id: created.id,
      },
    });

    await tx.template.update({
      where: { id: source.id },
      data: {
        sales_count: { increment: 1 },
        revenue_total: { increment: sellerAmount },
      },
    });

    if (appliedCouponId) {
      await tx.coupon.update({
        where: { id: appliedCouponId },
        data: { used_count: { increment: 1 } },
      });
    }

    await tx.payment.create({
      data: {
        user_id: user.id,
        gateway: Gateway.RAZORPAY,
        amount: gross,
        currency: source.currency,
        status: PaymentStatus.SUCCESS,
        coupon_id: appliedCouponId,
        discount_amount: discountAmount,
        metadata: {
          purpose: "community_template_buy",
          template_id: source.id,
          copy_template_id: created.id,
          base_price: basePrice,
          discount_amount: discountAmount,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
          fee_pct: feePct,
          calculation_rule: feeConfig.calculate_on_base_price ? "BASE_PRICE" : "NET_PRICE",
        },
      },
    });

    return created;
  });

  return NextResponse.json({
    ok: true,
    copyTemplateId: copy.id,
    copySlug: copy.slug,
    purchaseBreakdown: {
      basePrice,
      discount: discountAmount,
      paid: gross,
      platformFee,
      creatorEarned: sellerAmount,
    },
  });
}

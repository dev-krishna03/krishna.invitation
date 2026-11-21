import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { ensureCreatorSubscription } from "@/lib/workspace";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { Gateway, PaymentStatus, TemplateSource, Prisma } from "@prisma/client";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const source = await prisma.template.findUnique({ where: { id } });
  if (!source || !source.is_in_marketplace) {
    return NextResponse.json({ error: "Not for sale" }, { status: 404 });
  }
  if (source.owner_user_id === user.id) {
    return NextResponse.json({ error: "You already own this template." }, { status: 400 });
  }

  // Lock in the SELLER's fee rate from their plan at sale time.
  let feePct = 20;
  if (source.owner_user_id) {
    const { plan } = await ensureCreatorSubscription(source.owner_user_id);
    feePct = plan.platform_fee_pct;
  }
  const gross = source.price ?? 0;
  const platformFee = Math.round((gross * feePct) / 100);
  const sellerAmount = gross - platformFee;

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

    await tx.payment.create({
      data: {
        user_id: user.id,
        gateway: Gateway.RAZORPAY,
        amount: gross,
        currency: source.currency,
        status: PaymentStatus.SUCCESS,
        metadata: {
          purpose: "community_template_buy",
          template_id: source.id,
          copy_template_id: created.id,
          platform_fee: platformFee,
          seller_amount: sellerAmount,
        },
      },
    });

    return created;
  });

  return NextResponse.json({
    ok: true,
    templateId: copy.id,
    receipt: { gross, platformFee, sellerAmount, feePct },
  });
}

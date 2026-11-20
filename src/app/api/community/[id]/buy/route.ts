import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { Prisma, Gateway, PaymentStatus } from "@prisma/client";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const source = await prisma.invitation.findUnique({ where: { id } });
  if (!source || !source.is_in_community) {
    return NextResponse.json({ error: "Not for sale" }, { status: 404 });
  }

  // Copy the invitation into the buyer's library.
  const base = slugify(source.title);
  let slug = `${base}-${uniqueSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.invitation.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${uniqueSuffix()}`;
  }

  const copy = await prisma.invitation.create({
    data: {
      user_id: user.id,
      template_id: source.template_id,
      slug,
      title: `${source.title} (my copy)`,
      event_type: source.event_type,
      locale: source.locale,
      data: source.data as Prisma.InputJsonValue,
      is_published: false,
      is_in_community: false,
    },
  });

  // Record the purchase. Payment is recorded as SUCCESS in this demo; wire
  // real gateway flow through /api/payments/create-order in production.
  const amount = source.community_price ?? 0;
  await prisma.payment.create({
    data: {
      user_id: user.id,
      invitation_id: copy.id,
      gateway: Gateway.RAZORPAY,
      amount,
      currency: source.community_currency ?? "INR",
      status: PaymentStatus.SUCCESS,
      metadata: { community_source: source.id },
    },
  });

  return NextResponse.json({ ok: true, invitationId: copy.id });
}

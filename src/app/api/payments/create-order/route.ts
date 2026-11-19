import { NextResponse } from "next/server";
import { z } from "zod";
import { getActivePaymentProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Body = z.object({
  amount: z.number().int().positive(),
  currency: z.string().default("INR"),
  invitationId: z.string().uuid().optional(),
  planId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { amount, currency, invitationId, planId, couponCode } = parsed.data;

  let discount = 0;
  let coupon = null as Awaited<ReturnType<typeof prisma.coupon.findUnique>>;
  if (couponCode) {
    coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (coupon && coupon.is_active) {
      const now = new Date();
      const valid = (!coupon.valid_from || coupon.valid_from <= now) && (!coupon.valid_until || coupon.valid_until >= now);
      const usesLeft = !coupon.max_uses || coupon.used_count < coupon.max_uses;
      const meetsMin = !coupon.min_amount || amount >= coupon.min_amount;
      if (valid && usesLeft && meetsMin) {
        discount = coupon.type === "PERCENTAGE" ? Math.round((amount * coupon.value) / 100) : coupon.value;
      }
    }
  }
  const finalAmount = Math.max(0, amount - discount);

  const provider = await getActivePaymentProvider();
  const order = await provider.createOrder({
    amount: finalAmount,
    currency,
    metadata: { userId: user.id, invitationId, planId },
  });

  const payment = await prisma.payment.create({
    data: {
      user_id: user.id,
      invitation_id: invitationId ?? null,
      subscription_plan_id: planId ?? null,
      gateway: provider.gateway,
      gateway_order_id: order.id,
      amount: finalAmount,
      currency,
      coupon_id: coupon?.id ?? null,
      discount_amount: discount,
      metadata: { originalAmount: amount },
    },
  });

  await logAudit({ actorId: user.id, action: "payment.create", entityType: "Payment", entityId: payment.id, newValue: { amount: finalAmount, gateway: provider.gateway } });

  return NextResponse.json({ paymentId: payment.id, order });
}

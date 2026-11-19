import { NextResponse } from "next/server";
import { Gateway, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/payments";
import { logAudit } from "@/lib/audit";

const gatewayMap: Record<string, Gateway> = {
  razorpay: Gateway.RAZORPAY,
  cashfree: Gateway.CASHFREE,
  phonepe: Gateway.PHONEPE,
  stripe: Gateway.STRIPE,
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ gateway: string }> },
) {
  const { gateway: slug } = await ctx.params;
  const gateway = gatewayMap[slug];
  if (!gateway) return NextResponse.json({ error: "Unknown gateway" }, { status: 404 });

  const provider = await getProvider(gateway);
  const rawBody = await req.text();
  const headers: Record<string, string> = {};
  req.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));

  const event = await provider.parseWebhook(headers, rawBody);
  if (event.paymentId || event.orderId) {
    const clauses = [] as { gateway_payment_id?: string; gateway_order_id?: string }[];
    if (event.paymentId) clauses.push({ gateway_payment_id: event.paymentId });
    if (event.orderId) clauses.push({ gateway_order_id: event.orderId });
    const payment = clauses.length
      ? await prisma.payment.findFirst({ where: { OR: clauses } })
      : null;
    if (payment) {
      const mapped: Record<string, PaymentStatus> = {
        SUCCESS: "SUCCESS",
        FAILED: "FAILED",
        REFUNDED: "REFUNDED",
        PENDING: "PENDING",
      };
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: mapped[event.status ?? "PENDING"] ?? "PENDING",
          gateway_payment_id: event.paymentId ?? payment.gateway_payment_id,
        },
      });
    }
  }

  await logAudit({
    action: `webhook.${slug}`,
    entityType: "Webhook",
    entityId: event.id,
    newValue: { type: event.type, status: event.status },
  });

  return NextResponse.json({ ok: true });
}

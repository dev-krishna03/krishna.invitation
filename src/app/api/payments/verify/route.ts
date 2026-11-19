import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/payments";
import { requireUser } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";

const Body = z.object({
  paymentId: z.string().uuid(),
  gatewayPaymentId: z.string(),
  gatewayOrderId: z.string(),
  signature: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id: parsed.data.paymentId } });
  if (!payment || payment.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const provider = await getProvider(payment.gateway);
  const result = await provider.verifyPayment({
    orderId: parsed.data.gatewayOrderId,
    paymentId: parsed.data.gatewayPaymentId,
    signature: parsed.data.signature,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      gateway_payment_id: parsed.data.gatewayPaymentId,
      status: result.ok ? "SUCCESS" : "FAILED",
    },
  });

  if (result.ok && payment.coupon_id) {
    await prisma.coupon.update({
      where: { id: payment.coupon_id },
      data: { used_count: { increment: 1 } },
    });
  }

  await logAudit({ actorId: user.id, action: "payment.verify", entityType: "Payment", entityId: payment.id, newValue: { status: updated.status } });

  return NextResponse.json({ ok: result.ok, status: updated.status });
}

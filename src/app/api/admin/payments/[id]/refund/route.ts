import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { getProvider } from "@/lib/payments";
import { logAudit } from "@/lib/audit";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.status !== "SUCCESS" || !payment.gateway_payment_id)
    return NextResponse.json({ error: "Refund not allowed" }, { status: 400 });
  const provider = await getProvider(payment.gateway);
  const refund = await provider.processRefund(payment.gateway_payment_id, payment.amount);
  await prisma.payment.update({ where: { id }, data: { status: refund.status === "SUCCESS" ? "REFUNDED" : payment.status } });
  await logAudit({ actorId: g.id, action: "payment.refund", entityType: "Payment", entityId: id, newValue: refund });
  return NextResponse.json({ ok: true, refund });
}

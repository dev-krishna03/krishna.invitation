import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { Gateway, PaymentStatus } from "@prisma/client";

const Body = z.object({
  access_limit: z.number().int().positive().nullable(),
  amount: z.number().int().nonnegative(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      access_limit: parsed.data.access_limit,
      is_published: true,
      published_at: inv.published_at ?? new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      user_id: user.id,
      invitation_id: id,
      gateway: Gateway.RAZORPAY,
      amount: parsed.data.amount,
      currency: "INR",
      status: PaymentStatus.SUCCESS,
      metadata: { access_limit: parsed.data.access_limit },
    },
  });

  return NextResponse.json({ ok: true, invitation: { id: updated.id, access_limit: updated.access_limit } });
}

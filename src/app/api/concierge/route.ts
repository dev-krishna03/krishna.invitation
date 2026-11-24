import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { invitationId, amount, notes } = body;

    const order = await prisma.conciergeServiceOrder.create({
      data: {
        user_id: user.id,
        invitation_id: invitationId || null,
        amount: amount || 999,
        notes: notes || "Host purchased done-for-you concierge service.",
        status: "NEW",
      },
    });

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create concierge order" }, { status: 500 });
  }
}

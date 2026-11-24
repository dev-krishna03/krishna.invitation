import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

// POST: Creator submits a bid, or host accepts a bid
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    if (action === "submit_bid") {
      const { amount, proposal, delivery_days, sample_url } = body;
      if (!amount || !proposal) {
        return NextResponse.json({ error: "Amount and proposal are required" }, { status: 400 });
      }

      const bid = await prisma.designBid.create({
        data: {
          request_id: id,
          creator_user_id: user.id,
          amount: Number(amount),
          proposal,
          delivery_days: Number(delivery_days) || 3,
          sample_url: sample_url || null,
          status: "PENDING",
        },
      });

      return NextResponse.json({ ok: true, bid });
    }

    if (action === "accept_bid") {
      const { bid_id } = body;
      const request = await prisma.customDesignRequest.findUnique({ where: { id } });
      if (!request || request.host_user_id !== user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      // Mark bid accepted and request IN_PROGRESS
      await prisma.designBid.update({
        where: { id: bid_id },
        data: { status: "ACCEPTED" },
      });

      await prisma.customDesignRequest.update({
        where: { id },
        data: { status: "IN_PROGRESS", accepted_bid_id: bid_id },
      });

      return NextResponse.json({ ok: true, message: "Bid accepted. Escrow initialized." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

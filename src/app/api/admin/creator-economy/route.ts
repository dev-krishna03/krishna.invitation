import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customRequests = await prisma.customDesignRequest.findMany({
      include: {
        host: { select: { id: true, name: true, email: true } },
        bids: {
          include: { creator: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const conciergeOrders = await prisma.conciergeServiceOrder.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        invitation: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const affiliatePartners = await prisma.affiliatePartner.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        referrals: true,
      },
      orderBy: { total_earned: "desc" },
    });

    const payoutRequests = await prisma.creatorPayoutRequest.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const creatorTiers = [
      { tier: "Bronze", minSales: 0, platformFeePct: 12, benefits: "Standard marketplace listing, 7-day payouts" },
      { tier: "Silver", minSales: 10, platformFeePct: 10, benefits: "Verified Creator badge, priority review" },
      { tier: "Gold", minSales: 50, platformFeePct: 8, benefits: "Featured row placement, 8% fee, 3-day payouts" },
      { tier: "Platinum Studio", minSales: 150, platformFeePct: 5, benefits: "Direct concierge assignments, 5% fee, instant payouts" },
    ];

    return NextResponse.json({
      customRequests,
      conciergeOrders,
      affiliatePartners,
      payoutRequests,
      creatorTiers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch creator economy data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "update_concierge_status") {
      const { order_id, status, assigned_to } = body;
      await prisma.conciergeServiceOrder.update({
        where: { id: order_id },
        data: {
          status,
          ...(assigned_to ? { assigned_to } : {}),
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "payout_affiliate") {
      const { affiliate_id, amount } = body;
      const partner = await prisma.affiliatePartner.findUnique({
        where: { id: affiliate_id },
      });
      if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

      await prisma.affiliatePartner.update({
        where: { id: affiliate_id },
        data: {
          total_paid: partner.total_paid + amount,
        },
      });
      return NextResponse.json({ ok: true });
    }

    if (action === "approve_creator_payout") {
      const { payout_id, utr_reference, admin_notes } = body;
      const payout = await prisma.creatorPayoutRequest.update({
        where: { id: payout_id },
        data: {
          status: "COMPLETED",
          utr_reference: utr_reference || `BANK-${Date.now().toString(36).toUpperCase()}`,
          admin_notes: admin_notes || "Disbursed via Central Platform Bank Transfer / UPI",
          processed_at: new Date(),
        },
      });
      return NextResponse.json({ ok: true, payout });
    }

    if (action === "reject_creator_payout") {
      const { payout_id, reason } = body;
      const payout = await prisma.creatorPayoutRequest.update({
        where: { id: payout_id },
        data: {
          status: "REJECTED",
          admin_notes: reason || "Rejected by administrator",
          processed_at: new Date(),
        },
      });
      return NextResponse.json({ ok: true, payout });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

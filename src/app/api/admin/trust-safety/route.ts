import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const copyrightReports = await prisma.copyrightReport.findMany({
      include: { template: true },
      orderBy: { created_at: "desc" },
    });

    const creatorStrikes = await prisma.creatorStrike.findMany({
      include: { creator: true },
      orderBy: { created_at: "desc" },
    });

    const flaggedWishes = await prisma.guestWish.findMany({
      where: { OR: [{ is_flagged: true }, { is_approved: false }] },
      include: { invitation: true },
      orderBy: { created_at: "desc" },
    });

    const dpdpStats = {
      totalConsents: await prisma.guest.count({ where: { dpdp_consent: true } }),
      expiredEventsCount: await prisma.invitation.count({
        where: { expires_at: { lt: new Date() } },
      }),
      autoDeleteDays: 30,
    };

    return NextResponse.json({
      copyrightReports,
      creatorStrikes,
      flaggedWishes,
      dpdpStats,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trust & safety data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "resolve_copyright") {
      const { report_id, resolution, issue_strike } = body;
      const report = await prisma.copyrightReport.update({
        where: { id: report_id },
        data: {
          status: resolution === "UPHELD" ? "UPHELD" : "DISMISSED",
          action_taken: resolution === "UPHELD" ? "Template delisted and creator notified." : "Claim dismissed as unsubstantiated.",
        },
        include: { template: true },
      });

      if (resolution === "UPHELD" && report.template) {
        // Delist template
        await prisma.template.update({
          where: { id: report.template.id },
          data: { is_in_marketplace: false, moderation_status: "TAKEN_DOWN" },
        });

        // Optionally issue strike
        if (issue_strike && report.template.owner_user_id) {
          const currentCount = await prisma.creatorStrike.count({
            where: { creator_user_id: report.template.owner_user_id },
          });
          await prisma.creatorStrike.create({
            data: {
              creator_user_id: report.template.owner_user_id,
              reason: `Copyright infringement upheld on template: ${report.template.name}`,
              strike_number: currentCount + 1,
            },
          });
        }
      }

      return NextResponse.json({ ok: true });
    }

    if (action === "moderate_wish") {
      const { wish_id, approved } = body;
      if (approved) {
        await prisma.guestWish.update({
          where: { id: wish_id },
          data: { is_approved: true, is_flagged: false },
        });
      } else {
        await prisma.guestWish.delete({
          where: { id: wish_id },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "purge_dpdp_expired") {
      // DPDP Act: Redact guest phone numbers for invitations expired > 30 days ago
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const expiredInvs = await prisma.invitation.findMany({
        where: { expires_at: { lt: cutoff } },
        select: { id: true },
      });

      const invIds = expiredInvs.map((i) => i.id);

      const result = await prisma.guest.updateMany({
        where: {
          invitation_id: { in: invIds },
          phone: { not: null },
        },
        data: {
          phone: "[REDACTED_DPDP_COMPLIANCE]",
          dietary_notes: null,
          travel_details: {},
        },
      });

      return NextResponse.json({ ok: true, redactedCount: result.count });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Trust & safety action failed" }, { status: 500 });
  }
}

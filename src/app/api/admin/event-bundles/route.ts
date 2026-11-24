import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const bundledInvitations = await prisma.invitation.findMany({
      where: { bundle_enabled: true },
      include: {
        events: true,
        _count: { select: { guests: true, wishes: true } },
      },
      orderBy: { created_at: "desc" },
    });

    const standardFunctions = [
      { name: "Ganesh Sthapana / Pooja", defaultDuration: "2 hours", icon: "flame", occasion: "wedding" },
      { name: "Haldi & Pithi Ceremony", defaultDuration: "3 hours", icon: "flower", occasion: "wedding" },
      { name: "Mehendi & Sangeet Night", defaultDuration: "5 hours", icon: "music", occasion: "wedding" },
      { name: "Vedic Vivah (Baraat & Pheras)", defaultDuration: "4 hours", icon: "heart", occasion: "wedding" },
      { name: "Royal Reception Dinner", defaultDuration: "4 hours", icon: "wine", occasion: "wedding" },
      { name: "Griha Shanti & Vastu Havan", defaultDuration: "3 hours", icon: "home", occasion: "housewarming" },
      { name: "Godh Bharai / Seemantham", defaultDuration: "3 hours", icon: "baby", occasion: "baby_shower" },
    ];

    const bundleTiers = [
      {
        slug: "FULL_SUITE",
        name: "Full 4-Stage Occasion Suite",
        multiplier: 2.2,
        includedStages: [
          "Save-the-Date Card",
          "Main Multi-Event Invitation",
          "Venue & Map WhatsApp Reminder",
          "Post-Event Photo & Thank You Card",
        ],
        description: "1 unified guest list, 1 link family, 4 progressive celebration stages.",
      },
    ];

    return NextResponse.json({
      bundledInvitations,
      standardFunctions,
      bundleTiers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch bundle data" }, { status: 500 });
  }
}

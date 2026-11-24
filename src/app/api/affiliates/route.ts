import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

// GET: Current user's affiliate partner info or lookup
export async function GET() {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const partner = await prisma.affiliatePartner.findUnique({
      where: { user_id: user.id },
      include: {
        referrals: { orderBy: { created_at: "desc" }, take: 10 },
      },
    });

    return NextResponse.json({ partner });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch affiliate details" }, { status: 500 });
  }
}

// POST: Join the affiliate program & generate affiliate code
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { code, company_name, category } = body;

    const cleanCode = (code || user.name || "PARTNER")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 16);

    const partner = await prisma.affiliatePartner.upsert({
      where: { user_id: user.id },
      update: {
        company_name: company_name || undefined,
        category: category || "PHOTOGRAPHER",
      },
      create: {
        user_id: user.id,
        code: cleanCode,
        company_name: company_name || `${user.name || "Partner"} Studio`,
        category: category || "PHOTOGRAPHER",
        commission_pct: 12,
        total_earned: 0,
        total_paid: 0,
      },
    });

    return NextResponse.json({ ok: true, partner });
  } catch (error) {
    return NextResponse.json({ error: "Failed to register affiliate code" }, { status: 500 });
  }
}

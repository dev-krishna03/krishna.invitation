import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const RequestPayoutSchema = z.object({
  amount: z.number().int().min(500, "Minimum payout withdrawal is ₹500"),
  method: z.enum(["BANK", "UPI"]),
});

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const requests = await prisma.creatorPayoutRequest.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => ({}));
  const parsed = RequestPayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payout request", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // Get Creator's Bank & Payout Profile
  const profile = await prisma.creatorPayoutProfile.findUnique({
    where: { user_id: user.id },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Please configure your Bank Account or UPI details in the workspace first." },
      { status: 400 },
    );
  }

  if (parsed.data.method === "UPI" && !profile.upi_id) {
    return NextResponse.json({ error: "No UPI ID found on your profile." }, { status: 400 });
  }

  if (parsed.data.method === "BANK" && (!profile.account_number || !profile.ifsc_code)) {
    return NextResponse.json(
      { error: "Incomplete bank account number or IFSC code on your profile." },
      { status: 400 },
    );
  }

  // Calculate creator's WhatsApp send volume from their templates
  // Deduct WhatsApp delivery cost (₹1 per recipient message sent from our platform number)
  const templatesOwned = await prisma.template.findMany({
    where: { owner_user_id: user.id },
    select: { id: true },
  });
  const templateIds = templatesOwned.map((t) => t.id);

  // Approximate whatsapp delivery count for invitations built from creator's templates
  const totalInvitations = await prisma.invitation.count({
    where: { template_id: { in: templateIds } },
  });
  const whatsappMessagesSent = Math.min(parsed.data.amount * 0.05, totalInvitations * 2); // reasonable metric
  const whatsappFeeDeducted = Math.round(whatsappMessagesSent * 1); // ₹1 per msg

  const netPayoutAmount = Math.max(0, parsed.data.amount - whatsappFeeDeducted);

  const payoutRequest = await prisma.creatorPayoutRequest.create({
    data: {
      user_id: user.id,
      amount: parsed.data.amount,
      whatsapp_fee_deducted: whatsappFeeDeducted,
      net_payout_amount: netPayoutAmount,
      method: parsed.data.method,
      account_number: profile.account_number,
      ifsc_code: profile.ifsc_code,
      bank_name: profile.bank_name,
      upi_id: profile.upi_id,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    ok: true,
    payoutRequest,
    message: `Withdrawal request for ₹${netPayoutAmount.toLocaleString()} submitted. Funds will be deposited via ${parsed.data.method} within 24 hours.`,
  });
}

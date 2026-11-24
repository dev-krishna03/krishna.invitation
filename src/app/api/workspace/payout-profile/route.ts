import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const PayoutProfileSchema = z.object({
  account_holder_name: z.string().min(2, "Account holder name is required"),
  bank_name: z.string().min(2, "Bank name is required"),
  account_number: z.string().min(6, "Valid account number is required"),
  ifsc_code: z.string().min(4, "Valid IFSC code is required").transform((val) => val.toUpperCase().trim()),
  upi_id: z.string().optional().nullable(),
  pan_number: z.string().optional().nullable().transform((val) => (val ? val.toUpperCase().trim() : null)),
  payout_preference: z.enum(["BANK", "UPI"]).default("BANK"),
});

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const profile = await prisma.creatorPayoutProfile.findUnique({
    where: { user_id: user.id },
  });

  return NextResponse.json({
    profile: profile || null,
  });
}

export async function PUT(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = await req.json().catch(() => ({}));
  const parsed = PayoutProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const profile = await prisma.creatorPayoutProfile.upsert({
    where: { user_id: user.id },
    update: {
      account_holder_name: data.account_holder_name,
      bank_name: data.bank_name,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code,
      upi_id: data.upi_id || null,
      pan_number: data.pan_number || null,
      payout_preference: data.payout_preference,
      is_verified: true,
    },
    create: {
      user_id: user.id,
      account_holder_name: data.account_holder_name,
      bank_name: data.bank_name,
      account_number: data.account_number,
      ifsc_code: data.ifsc_code,
      upi_id: data.upi_id || null,
      pan_number: data.pan_number || null,
      payout_preference: data.payout_preference,
      is_verified: true,
    },
  });

  return NextResponse.json({
    ok: true,
    profile,
    message: "Bank account and payout details saved securely.",
  });
}

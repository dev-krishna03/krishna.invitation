import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { generateReferralCode } from "@/lib/referral";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  referralCode: z.string().trim().min(1).max(32).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { name, email, password, referralCode } = parsed.data;

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Sign up failed" },
      { status: 400 },
    );
  }

  const referredBy = referralCode
    ? await prisma.user.findUnique({ where: { referral_code: referralCode } })
    : null;

  // Guarantee a unique referral code even under the rare collision.
  let code = generateReferralCode();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.user.findUnique({ where: { referral_code: code } });
    if (!exists) break;
    code = generateReferralCode();
  }

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        name,
        referral_code: code,
        referred_by_id: referredBy?.id ?? null,
      },
    });
  } catch (e) {
    // Roll back the auth user so the client can retry cleanly.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
      );
      await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create user" },
      { status: 500 },
    );
  }

  if (referredBy) {
    await prisma.user
      .update({
        where: { id: referredBy.id },
        data: { referral_credit: { increment: 1 } },
      })
      .catch(() => {});
  }

  await sendEmail({
    to: email,
    templateId: "welcome",
    params: { name, referralCode: code },
  });

  return NextResponse.json({ ok: true });
}

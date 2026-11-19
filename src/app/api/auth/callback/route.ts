import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/referral";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, url));
    }

    // First sign-in via OAuth: make sure the Prisma user row exists.
    const user = data.user;
    if (user) {
      const existing = await prisma.user.findUnique({ where: { id: user.id } });
      if (!existing) {
        let referralCode = generateReferralCode();
        for (let i = 0; i < 5; i++) {
          const collision = await prisma.user.findUnique({
            where: { referral_code: referralCode },
          });
          if (!collision) break;
          referralCode = generateReferralCode();
        }
        await prisma.user
          .create({
            data: {
              id: user.id,
              email: user.email ?? `${user.id}@unknown.local`,
              name:
                (user.user_metadata?.name as string | undefined) ??
                (user.user_metadata?.full_name as string | undefined) ??
                null,
              avatar_url:
                (user.user_metadata?.avatar_url as string | undefined) ?? null,
              referral_code: referralCode,
            },
          })
          .catch(() => {});
      }
    }
  }

  return NextResponse.redirect(new URL(next, url));
}

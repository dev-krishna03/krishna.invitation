import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/dashboard";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${url.origin}/api/auth/callback?next=${next}` },
  });
  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? "OAuth failed" },
      { status: 400 },
    );
  }
  return NextResponse.json({ url: data.url });
}

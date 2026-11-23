import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("demo_session");
  response.cookies.delete("krishna_admin");
  return response;
}

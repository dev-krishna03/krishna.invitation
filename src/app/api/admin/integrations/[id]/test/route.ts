import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { decryptCredentials } from "@/lib/crypto";
import { testBrevo } from "@/lib/email-templates";
import { testWhatsAppMessage } from "@/lib/whatsapp";
import { testGoogleMapsApiKey } from "@/lib/google-maps";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const row = await prisma.integrationCredential.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const creds = decryptCredentials(row.credentials as Record<string, unknown>);
  try {
    if (row.service_slug === "brevo") {
      await testBrevo(creds as never, g.email);
    } else if (row.service_slug === "supabase") {
      const { createClient } = await import("@supabase/supabase-js");
      const url = (creds.project_url as string) || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const key =
        (creds.service_role_key as string) ||
        (creds.anon_key as string) ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "";
      if (!url || !key || url.includes("placeholder.supabase.co")) {
        throw new Error(
          "Supabase Project URL and API Key must be set. Please enter valid Project URL and Service Role Key or Anon Key.",
        );
      }
      const client = createClient(url, key);
      const { data: buckets, error } = await client.storage.listBuckets();
      if (error) throw new Error(error.message);
    } else if (row.service_slug === "whatsapp") {
      const testPhone = body.recipient_phone || (creds.display_phone_number as string) || "+919876543210";
      await testWhatsAppMessage(testPhone);
    } else if (row.service_slug === "google-maps") {
      const apiKey = body.api_key || (creds.api_key as string) || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
      await testGoogleMapsApiKey(apiKey);
    }
    await prisma.integrationCredential.update({
      where: { id },
      data: { last_tested_at: new Date(), test_status: "PASS" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    await prisma.integrationCredential.update({
      where: { id },
      data: { last_tested_at: new Date(), test_status: "FAIL" },
    });
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Test failed" }, { status: 400 });
  }
}

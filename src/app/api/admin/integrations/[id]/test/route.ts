import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { decryptCredentials } from "@/lib/crypto";
import { testBrevo } from "@/lib/email-templates";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const row = await prisma.integrationCredential.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const creds = decryptCredentials(row.credentials as Record<string, unknown>);
  try {
    if (row.service_slug === "brevo") await testBrevo(creds as never, g.email);
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

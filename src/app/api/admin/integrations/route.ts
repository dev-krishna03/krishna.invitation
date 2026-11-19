import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const integrations = await prisma.integrationCredential.findMany({ orderBy: { service_slug: "asc" } });
  const safe = integrations.map((i) => ({
    ...i,
    credentials: Object.fromEntries(
      Object.entries((i.credentials as Record<string, unknown>) ?? {}).map(([k, v]) => [k, v ? "••••" : ""]),
    ),
  }));
  return NextResponse.json({ integrations: safe });
}

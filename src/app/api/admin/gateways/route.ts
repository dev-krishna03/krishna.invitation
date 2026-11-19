import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const gateways = await prisma.paymentGateway.findMany({ orderBy: { name: "asc" } });
  // Never return credentials — only field names.
  const safe = gateways.map((g) => ({
    ...g,
    credentials: Object.fromEntries(
      Object.entries((g.credentials as Record<string, unknown>) ?? {}).map(([k, v]) => [k, v ? "••••" : ""]),
    ),
  }));
  return NextResponse.json({ gateways: safe });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function GET() {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const settings = await prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const body = (await req.json().catch(() => ({}))) as { key: string; value: unknown };
  if (!body?.key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
  const before = await prisma.siteSetting.findUnique({ where: { key: body.key } });
  const setting = await prisma.siteSetting.upsert({
    where: { key: body.key },
    update: { value: body.value as Prisma.InputJsonValue, updated_by_id: g.id },
    create: { key: body.key, value: body.value as Prisma.InputJsonValue, updated_by_id: g.id },
  });
  await logAudit({ actorId: g.id, action: "setting.update", entityType: "SiteSetting", entityId: setting.id, oldValue: before, newValue: setting });
  return NextResponse.json({ setting });
}

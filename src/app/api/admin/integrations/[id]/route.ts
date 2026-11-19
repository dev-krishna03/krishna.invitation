import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, Environment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { encryptCredentials } from "@/lib/crypto";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  is_active: z.boolean().optional(),
  environment: z.nativeEnum(Environment).optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.integrationCredential.findUnique({ where: { id } });
  const update: Prisma.IntegrationCredentialUpdateInput = {};
  if (parsed.data.is_active !== undefined) update.is_active = parsed.data.is_active;
  if (parsed.data.environment) update.environment = parsed.data.environment;
  if (parsed.data.credentials) {
    update.credentials = encryptCredentials(parsed.data.credentials) as Prisma.InputJsonValue;
    update.is_configured = true;
  }
  update.updated_by = { connect: { id: g.id } };
  const row = await prisma.integrationCredential.update({ where: { id }, data: update });
  await logAudit({ actorId: g.id, action: "integration.update", entityType: "IntegrationCredential", entityId: id, oldValue: before, newValue: { ...row, credentials: "redacted" } });
  return NextResponse.json({ ok: true });
}

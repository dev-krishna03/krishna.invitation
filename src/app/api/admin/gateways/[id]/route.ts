import { NextResponse } from "next/server";
import { z } from "zod";
import { Environment, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { encryptCredentials, decryptCredentials } from "@/lib/crypto";
import { invalidatePaymentCache } from "@/lib/payments";
import { logAudit } from "@/lib/audit";

const Patch = z.object({
  is_active: z.boolean().optional(),
  environment: z.nativeEnum(Environment).optional(),
  webhook_secret: z.string().optional(),
  credentials: z.record(z.string(), z.unknown()).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireSuperAdmin();
  if (g instanceof NextResponse) return g;
  const { id } = await ctx.params;
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const before = await prisma.paymentGateway.findUnique({ where: { id } });

  const update: Prisma.PaymentGatewayUpdateInput = {};
  if (parsed.data.environment) update.environment = parsed.data.environment;
  if (parsed.data.webhook_secret !== undefined) update.webhook_secret = parsed.data.webhook_secret;
  if (parsed.data.credentials) {
    const existingDecrypted = before ? decryptCredentials(before.credentials as Record<string, unknown>) : {};
    const merged: Record<string, unknown> = { ...existingDecrypted };
    for (const [k, v] of Object.entries(parsed.data.credentials)) {
      if (typeof v === "string" && v.startsWith("••")) {
        // keep existing value
      } else if (v !== undefined && v !== "") {
        merged[k] = v;
      }
    }
    update.credentials = encryptCredentials(merged) as Prisma.InputJsonValue;
  }

  if (parsed.data.is_active === true) {
    await prisma.paymentGateway.updateMany({ where: { NOT: { id } }, data: { is_active: false } });
    update.is_active = true;
  } else if (parsed.data.is_active === false) {
    update.is_active = false;
  }

  const gateway = await prisma.paymentGateway.update({
    where: { id },
    data: { ...update, updated_by: { connect: { id: g.id } } },
  });
  invalidatePaymentCache();
  await logAudit({ actorId: g.id, action: "gateway.update", entityType: "PaymentGateway", entityId: id, oldValue: before, newValue: { ...gateway, credentials: "redacted" } });
  return NextResponse.json({ ok: true });
}

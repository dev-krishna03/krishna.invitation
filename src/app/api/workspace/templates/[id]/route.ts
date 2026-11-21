import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { canSellMoreTemplates } from "@/lib/workspace";

const Patch = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(400).optional(),
  category: z.enum(["LUXURY", "MINIMAL", "TRADITIONAL", "MODERN", "FLORAL", "RUSTIC"]).optional(),
  event_types: z.array(z.string()).optional(),
  thumbnail_url: z.string().url().optional(),
  is_in_marketplace: z.boolean().optional(),
  price: z.number().int().nonnegative().nullable().optional(),
  currency: z.string().length(3).optional(),
});

async function own(id: string, userId: string) {
  const t = await prisma.template.findUnique({ where: { id } });
  return t && t.owner_user_id === userId ? t : null;
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const existing = await own(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  if (parsed.data.is_in_marketplace === true && !existing.is_in_marketplace) {
    const check = await canSellMoreTemplates(user.id);
    if (!check.ok) return NextResponse.json({ error: check.reason }, { status: 402 });
    if (parsed.data.price == null && existing.price == null) {
      return NextResponse.json({ error: "Set a price before listing." }, { status: 400 });
    }
  }

  const template = await prisma.template.update({
    where: { id },
    data: parsed.data,
  });
  return NextResponse.json({ template });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const existing = await own(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const usedBy = await prisma.invitation.count({ where: { template_id: id } });
  if (usedBy > 0) {
    return NextResponse.json({ error: `Still used by ${usedBy} invitation(s). Deactivate instead.` }, { status: 400 });
  }
  await prisma.template.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

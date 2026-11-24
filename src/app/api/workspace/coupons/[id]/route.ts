import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { z } from "zod";

const PatchSchema = z.object({
  is_active: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing || existing.creator_user_id !== user.id) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: {
      ...(parsed.data.is_active !== undefined ? { is_active: parsed.data.is_active } : {}),
    },
  });

  return NextResponse.json({ ok: true, coupon: updated });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const existing = await prisma.coupon.findUnique({
    where: { id },
  });

  if (!existing || existing.creator_user_id !== user.id) {
    return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  }

  await prisma.coupon.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true, message: "Coupon deleted" });
}

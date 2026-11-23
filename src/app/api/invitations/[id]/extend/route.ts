import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const Body = z.object({
  days: z.number().int().min(1).max(365),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;

  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid days value" }, { status: 400 });
  }

  const currentExpiry = inv.expires_at && new Date(inv.expires_at) > new Date()
    ? new Date(inv.expires_at)
    : new Date();

  const newExpiry = new Date(currentExpiry.getTime() + parsed.data.days * 24 * 60 * 60 * 1000);

  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      expires_at: newExpiry,
      is_published: true,
    },
  });

  return NextResponse.json({
    ok: true,
    expires_at: updated.expires_at,
    message: `Validity successfully extended by +${parsed.data.days} days!`,
  });
}

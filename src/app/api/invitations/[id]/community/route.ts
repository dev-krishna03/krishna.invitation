import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const Body = z.object({
  is_in_community: z.boolean(),
  community_price: z.number().int().nonnegative().nullable().optional(),
  community_currency: z.string().length(3).optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const updated = await prisma.invitation.update({
    where: { id },
    data: {
      is_in_community: parsed.data.is_in_community,
      community_price: parsed.data.community_price ?? null,
      community_currency: parsed.data.community_currency ?? "INR",
    },
  });
  return NextResponse.json({ invitation: updated });
}

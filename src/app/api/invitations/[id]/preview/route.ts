import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const token = crypto.randomBytes(16).toString("base64url");
  const updated = await prisma.invitation.update({
    where: { id },
    data: { preview_token: token, preview_approved: false },
  });
  return NextResponse.json({ preview_token: updated.preview_token });
}

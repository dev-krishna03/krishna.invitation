import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { Prisma } from "@prisma/client";

const Patch = z.object({
  title: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  music_url: z.string().url().nullable().optional(),
  is_published: z.boolean().optional(),
  expires_at: z.coerce.date().nullable().optional(),
  gift_upi_id: z.string().nullable().optional(),
  gift_notes: z.string().nullable().optional(),
  is_protected: z.boolean().optional(),
  bundle_stage: z.string().optional(),
});

async function own(id: string, userId: string) {
  const inv = await prisma.invitation.findUnique({ where: { id } });
  return inv && inv.user_id === userId ? inv : null;
}

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const invitation = await prisma.invitation.findUnique({
    where: { id },
    include: { template: true, events: true, photos: true, guests: true },
  });
  if (!invitation || invitation.user_id !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ invitation });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const existing = await own(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = Patch.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const update: Prisma.InvitationUpdateInput = { ...parsed.data } as Prisma.InvitationUpdateInput;
  if (parsed.data.is_published === true && !existing.published_at) {
    update.published_at = new Date();
  }
  if (parsed.data.data) update.data = parsed.data.data as Prisma.InputJsonValue;
  const invitation = await prisma.invitation.update({ where: { id }, data: update });
  return NextResponse.json({ invitation });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const existing = await own(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.invitation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

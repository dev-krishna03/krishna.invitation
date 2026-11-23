import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";

const GuestIn = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  group_name: z.string().optional(),
  plus_allowed: z.number().int().min(0).max(10).default(0),
});
const Body = z.object({ guests: z.array(GuestIn).min(1).max(1000) });

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const guests = await prisma.guest.findMany({ where: { invitation_id: id }, orderBy: { name: "asc" } });
  return NextResponse.json({ guests });
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const created = [];
  for (const g of parsed.data.guests) {
    const slug = `${slugify(g.name, 40)}-${uniqueSuffix(4)}`;
    created.push(
      await prisma.guest.create({
        data: { invitation_id: id, ...g, slug },
      }),
    );
  }
  return NextResponse.json({ guests: created });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const inv = await prisma.invitation.findUnique({ where: { id } });
  if (!inv || inv.user_id !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const url = new URL(req.url);
  const guestId = url.searchParams.get("guestId");
  if (!guestId) return NextResponse.json({ error: "Missing guestId" }, { status: 400 });
  await prisma.guest.deleteMany({ where: { id: guestId, invitation_id: id } });
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Body = z.object({ slug: z.string(), guestSlug: z.string().optional() });

function deviceFromUa(ua: string): string {
  if (/mobile|iphone|android/i.test(ua)) return "mobile";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  return "desktop";
}

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const invitation = await prisma.invitation.findUnique({ where: { slug: parsed.data.slug } });
  if (!invitation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let guestId: string | null = null;
  if (parsed.data.guestSlug) {
    const guest = await prisma.guest.findUnique({
      where: { invitation_id_slug: { invitation_id: invitation.id, slug: parsed.data.guestSlug } },
    });
    guestId = guest?.id ?? null;
    if (guest && !guest.viewed_at) {
      await prisma.guest.update({ where: { id: guest.id }, data: { viewed_at: new Date() } });
    }
  }

  const ua = req.headers.get("user-agent") ?? "";
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  const ipHash = ip ? crypto.createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;

  await prisma.invitationView.create({
    data: {
      invitation_id: invitation.id,
      guest_id: guestId,
      device_type: deviceFromUa(ua),
      browser: ua.slice(0, 120),
      ip_hash: ipHash,
    },
  });
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { view_count: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}

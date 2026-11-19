import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const Body = z.object({
  name: z.string().min(1),
  message: z.string().optional(),
  plus_allowed: z.number().int().min(0).max(10).optional(),
  status: z.enum(["ACCEPTED", "DECLINED", "MAYBE"]),
  dietary_notes: z.string().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ slug: string; guestSlug: string }> }) {
  const { slug, guestSlug } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { user: true },
  });
  if (!invitation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guest = await prisma.guest.update({
    where: { invitation_id_slug: { invitation_id: invitation.id, slug: guestSlug } },
    data: {
      name: parsed.data.name,
      rsvp_status: parsed.data.status,
      rsvp_at: new Date(),
      rsvp_message: parsed.data.message,
      dietary_notes: parsed.data.dietary_notes,
      plus_allowed: parsed.data.plus_allowed,
    },
  });

  await sendEmail({
    to: invitation.user.email,
    templateId: "RSVP_RECEIVED",
    params: { guestName: guest.name, status: guest.rsvp_status, invitationTitle: invitation.title },
  });

  return NextResponse.json({ ok: true });
}

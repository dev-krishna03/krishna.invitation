import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { Prisma } from "@prisma/client";

const Body = z.object({
  templateId: z.string().uuid(),
  title: z.string().min(1),
  eventType: z.string().min(1).default("wedding"),
  locale: z.string().default("en"),
  data: z.record(z.string(), z.unknown()).default({}),
  orgId: z.string().uuid().optional(),
});

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const list = await prisma.invitation.findMany({
    where: { user_id: user.id },
    include: { template: true, _count: { select: { guests: true, views: true } } },
    orderBy: { created_at: "desc" },
  });
  return NextResponse.json({ invitations: list });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const base = slugify(parsed.data.title);
  let slug = `${base}-${uniqueSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.invitation.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${uniqueSuffix()}`;
  }

  const invitation = await prisma.invitation.create({
    data: {
      user_id: user.id,
      org_id: parsed.data.orgId ?? null,
      template_id: parsed.data.templateId,
      title: parsed.data.title,
      event_type: parsed.data.eventType,
      locale: parsed.data.locale,
      slug,
      data: parsed.data.data as Prisma.InputJsonValue,
    },
  });
  return NextResponse.json({ invitation });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { slugify, uniqueSuffix } from "@/lib/slug";
import { TemplateCategory, TemplateSource, Prisma } from "@prisma/client";

const Body = z.object({
  source: z.enum(["blank", "fromInvitation", "importCommunity"]),
  name: z.string().min(1).max(120),
  category: z.nativeEnum(TemplateCategory).default("MINIMAL"),
  event_types: z.array(z.string()).default([]),
  description: z.string().max(400).optional(),
  invitationId: z.string().uuid().optional(),
  communityTemplateId: z.string().uuid().optional(),
});

export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const templates = await prisma.template.findMany({
    where: { owner_user_id: user.id },
    orderBy: { updated_at: "desc" },
  });
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Build a unique slug from the chosen name.
  const base = slugify(parsed.data.name);
  let slug = `${base}-${uniqueSuffix()}`;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.template.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${base}-${uniqueSuffix()}`;
  }

  let source: TemplateSource = TemplateSource.USER_CREATED;
  let source_invitation_id: string | null = null;
  let imported_from_template_id: string | null = null;
  let category: TemplateCategory = parsed.data.category;
  let event_types: string[] = parsed.data.event_types;
  let description: string | null = parsed.data.description ?? null;
  let thumbnail_url: string | null = null;

  if (parsed.data.source === "fromInvitation" && parsed.data.invitationId) {
    const inv = await prisma.invitation.findUnique({
      where: { id: parsed.data.invitationId },
      include: { template: true },
    });
    if (!inv || inv.user_id !== user.id) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }
    source = TemplateSource.FROM_INVITATION;
    source_invitation_id = inv.id;
    category = inv.template.category;
    event_types = [inv.event_type];
  } else if (parsed.data.source === "importCommunity" && parsed.data.communityTemplateId) {
    const src = await prisma.template.findUnique({ where: { id: parsed.data.communityTemplateId } });
    if (!src || !src.is_in_marketplace) {
      return NextResponse.json({ error: "Not in marketplace" }, { status: 404 });
    }
    source = TemplateSource.USER_IMPORTED;
    imported_from_template_id = src.id;
    category = src.category;
    event_types = src.event_types;
    description = src.description;
    thumbnail_url = src.thumbnail_url;
  }

  const template = await prisma.template.create({
    data: {
      name: parsed.data.name,
      slug,
      category,
      event_types,
      description: description ?? undefined,
      thumbnail_url: thumbnail_url ?? undefined,
      owner_user_id: user.id,
      source,
      source_invitation_id,
      imported_from_template_id,
      is_active: true,
      is_featured: false,
    } satisfies Prisma.TemplateUncheckedCreateInput,
  });
  return NextResponse.json({ template });
}

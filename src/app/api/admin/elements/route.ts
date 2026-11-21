import { NextResponse } from "next/server";
import { z } from "zod";
import { ElementKind, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/slug";
import { logAudit } from "@/lib/audit";

const Create = z.object({
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  kind: z.nativeEnum(ElementKind),
  category: z.string().min(1).default("basic"),
  icon: z.string().max(40).optional(),
  description: z.string().max(400).optional(),
  default_props: z.record(z.string(), z.unknown()).default({}),
  is_pro_only: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export async function GET() {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const elements = await prisma.templateElement.findMany({ orderBy: { sort_order: "asc" } });
  return NextResponse.json({ elements });
}

export async function POST(req: Request) {
  const guard = await requireSuperAdmin();
  if (guard instanceof NextResponse) return guard;
  const parsed = Create.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const slug = parsed.data.slug?.trim() || slugify(parsed.data.name);
  const exists = await prisma.templateElement.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "Slug already exists" }, { status: 400 });

  const maxOrder = await prisma.templateElement.aggregate({ _max: { sort_order: true } });
  const el = await prisma.templateElement.create({
    data: {
      slug,
      name: parsed.data.name,
      kind: parsed.data.kind,
      category: parsed.data.category,
      icon: parsed.data.icon ?? null,
      description: parsed.data.description ?? null,
      default_props: parsed.data.default_props as Prisma.InputJsonValue,
      is_pro_only: parsed.data.is_pro_only,
      is_active: parsed.data.is_active,
      sort_order: (maxOrder._max.sort_order ?? 0) + 1,
    },
  });
  await logAudit({ actorId: guard.id, action: "element.create", entityType: "TemplateElement", entityId: el.id, newValue: el });
  return NextResponse.json({ element: el });
}

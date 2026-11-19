import { prisma } from "@/lib/prisma";
import { TemplateManager } from "@/components/admin/TemplateManager";

export const metadata = {
  title: "Templates & Songs • Krishna Super Admin",
};

export default async function AdminTemplatesPage() {
  const templates = await prisma.template.findMany({
    include: {
      pricing: { orderBy: { duration_days: "asc" } },
      _count: { select: { invitations: true } },
    },
    orderBy: { sort_order: "asc" },
  });

  const formattedTemplates = templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    thumbnail_url: t.thumbnail_url,
    preview_url: t.preview_url,
    category: t.category,
    event_types: t.event_types,
    is_active: t.is_active,
    is_featured: t.is_featured,
    sort_order: t.sort_order,
    pricing: t.pricing.map((p) => ({
      id: p.id,
      duration_days: p.duration_days,
      price: p.price,
    })),
    _count: t._count,
  }));

  return <TemplateManager initialTemplates={formattedTemplates} />;
}

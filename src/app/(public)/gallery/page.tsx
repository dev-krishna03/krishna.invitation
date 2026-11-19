import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal } from "@/components/motion/Reveal";

export default async function GalleryPage() {
  const templates = await prisma.template.findMany({
    where: { is_active: true },
    include: { pricing: { where: { is_active: true }, orderBy: { duration_days: "asc" } } },
    orderBy: [{ is_featured: "desc" }, { sort_order: "asc" }],
  });
  const items = templates.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    category: t.category,
    description: t.description,
    fromPrice: t.pricing[0] ? { price: t.pricing[0].price, days: t.pricing[0].duration_days } : null,
  }));
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <Reveal>
        <h1 className="text-3xl font-semibold">Template Gallery</h1>
        <p className="mt-2 text-gray-600">Pick a design for your event.</p>
      </Reveal>
      <GalleryGrid items={items} />
    </main>
  );
}

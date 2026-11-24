import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { Reveal } from "@/components/motion/Reveal";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Invitation Designs Gallery • Krishna Invitations",
  description: "Browse royal, minimalist, and traditional digital invitation templates for weddings, housewarmings, and celebrations.",
};

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
    thumbnail_url: t.thumbnail_url,
    fromPrice: t.pricing[0] ? { price: t.pricing[0].price, days: t.pricing[0].duration_days } : null,
  }));

  return (
    <PublicPageShell>
      <main className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Handcrafted Digital Invitations</span>
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl text-stone-900">
              Explore Our Design Gallery
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Every design is crafted with cultural devotion and cutting-edge interactive features:
              musical ambiance, Google Maps, RSVP counter, and 1-click WhatsApp delivery.
            </p>
          </div>
        </Reveal>

        <GalleryGrid items={items} />
      </main>
    </PublicPageShell>
  );
}

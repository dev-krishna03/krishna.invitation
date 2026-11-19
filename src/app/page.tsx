import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { HeroShine } from "@/components/motion/HeroShine";
import { AnimatedButton } from "@/components/motion/AnimatedButton";
import { OccasionsGrid } from "@/components/landing/OccasionsGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedGrid } from "@/components/landing/FeaturedGrid";

export default async function Home() {
  const [featured, eventTypes] = await Promise.all([
    prisma.template.findMany({
      where: { is_active: true, is_featured: true },
      take: 6,
      include: { pricing: { orderBy: { duration_days: "asc" }, take: 1 } },
    }),
    prisma.eventTypeConfig.findMany({
      where: { is_active: true, parent_id: null },
      orderBy: [{ is_featured: "desc" }, { sort_order: "asc" }],
      include: {
        children: {
          where: { is_active: true },
          orderBy: { sort_order: "asc" },
          select: { slug: true, name: true, icon: true },
        },
      },
    }),
  ]);

  const occasions = eventTypes.map((e) => ({
    key: e.slug,
    label: e.name,
    icon: e.icon ?? undefined,
    children: e.children.map((c) => ({ key: c.slug, label: c.name, icon: c.icon ?? undefined })),
  }));

  const featuredItems = featured.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    from: t.pricing[0] ? { price: t.pricing[0].price, days: t.pricing[0].duration_days } : undefined,
  }));

  return (
    <main>
      <HeroShine>
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <Reveal delay={0}>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Invitation Platform</p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
              Beautiful digital invitations for every moment that matters.
            </h1>
          </Reveal>
          <Reveal delay={0.25}>
            <p className="mt-6 text-lg text-gray-600">
              Weddings, birthdays, Gruh Vastu, baby showers, engagements, and more.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-8 flex justify-center gap-3">
              <AnimatedButton href="/gallery">Explore Designs</AnimatedButton>
              <AnimatedButton href="/pricing" variant="ghost">See Pricing</AnimatedButton>
            </div>
          </Reveal>
        </section>
      </HeroShine>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <Reveal>
          <h2 className="text-2xl font-semibold">How it works</h2>
        </Reveal>
        <HowItWorks />
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <Reveal>
          <h2 className="text-2xl font-semibold">Occasions</h2>
        </Reveal>
        <OccasionsGrid items={occasions} />
      </section>

      {featuredItems.length > 0 && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <Reveal>
            <h2 className="text-2xl font-semibold">Featured designs</h2>
          </Reveal>
          <FeaturedGrid items={featuredItems} />
        </section>
      )}

      <footer className="border-t bg-gray-50 py-10 text-center text-sm text-gray-600">
        <div className="mx-auto max-w-5xl px-6">
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="/gallery">Gallery</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/about">About</Link>
            <Link href="/login">Sign in</Link>
          </nav>
          <p className="mt-4">© {new Date().getFullYear()} Invitation Platform</p>
        </div>
      </footer>
    </main>
  );
}

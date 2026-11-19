import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { HeroShine } from "@/components/motion/HeroShine";
import { AnimatedButton } from "@/components/motion/AnimatedButton";
import { OccasionsGrid } from "@/components/landing/OccasionsGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedGrid } from "@/components/landing/FeaturedGrid";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { Sparkles, Heart, Star, CheckCircle2 } from "lucide-react";

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
    <PublicPageShell>
      {/* Hero Section */}
      <HeroShine>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center">
          {/* Trust Badge */}
          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-rose-50 px-4 py-1.5 text-xs font-semibold text-rose-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse-subtle" />
              <span>Over 50,000+ Sacred Celebrations Crafted</span>
              <span className="hidden sm:inline text-amber-500">•</span>
              <span className="hidden sm:inline text-amber-800 font-medium">Instant WhatsApp RSVP</span>
            </div>
          </Reveal>

          {/* Main Headline */}
          <Reveal delay={0.1}>
            <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl sm:leading-[1.15]">
              Bespoke Digital Invitations for Every{" "}
              <span className="shimmer-text">Moment That Matters.</span>
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal delay={0.25}>
            <p className="mx-auto mt-6 max-w-2xl text-base text-stone-600 sm:text-lg leading-relaxed">
              Honor your culture with luxury interactive invitations. Complete with background music,
              multi-day timelines, Google Maps directions, and 1-click WhatsApp RSVP tracking.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.35}>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
              <AnimatedButton href="/gallery" variant="luxury">
                <Sparkles className="h-4 w-4" />
                <span>Explore Design Gallery</span>
              </AnimatedButton>
              <AnimatedButton href="/pricing" variant="ghost">
                View Pricing
              </AnimatedButton>
            </div>
          </Reveal>

          {/* Social Proof Snippet */}
          <Reveal delay={0.45}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-stone-800">4.9/5 Rating</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>14+ Indian & Global Languages</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
                <span>100% Eco-Friendly</span>
              </div>
            </div>
          </Reveal>

          {/* Interactive Live Mockup Showcase */}
          <Reveal delay={0.55}>
            <HeroShowcase />
          </Reveal>
        </section>
      </HeroShine>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-700">Simple Process</p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-stone-900">
              How Your Celebration Unfolds
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              From choosing your favorite royal template to welcoming your guests with WhatsApp RSVP,
              everything happens seamlessly in minutes.
            </p>
          </Reveal>
        </div>
        <HowItWorks />
      </section>

      {/* Occasions Section */}
      <section id="occasions" className="border-y border-stone-200/80 bg-stone-50/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-700">Every Ceremony</p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-stone-900">
                Tailored for India's Grand Traditions
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
                Whether it's a multi-day Big Fat Indian Wedding, an auspicious Gruh Vastu, or a joyful 1st birthday.
              </p>
            </Reveal>
          </div>
          <OccasionsGrid items={occasions} />
        </div>
      </section>

      {/* Featured Designs Showcase */}
      {featuredItems.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Reveal>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-700">Curated Collection</p>
                <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-stone-900">
                  Featured Invitation Designs
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-600">
                  Meticulously designed with sacred motifs, music, and interactive RSVP flows.
                </p>
              </Reveal>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 transition-colors"
            >
              <span>View All Templates</span>
              <span>→</span>
            </Link>
          </div>
          <FeaturedGrid items={featuredItems} />
        </section>
      )}

      {/* Features & Benefits */}
      <section className="border-t border-stone-200/80 bg-gradient-to-b from-white to-stone-50/70 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-700">Why Digital</p>
              <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-stone-900">
                Everything You Need for a Seamless Host Experience
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
                No lost paper cards, no confusing directions, and zero RSVP guesswork.
              </p>
            </Reveal>
          </div>
          <FeaturesSection />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-700">Host Stories</p>
            <h2 className="mt-2 font-serif text-3xl font-bold sm:text-4xl text-stone-900">
              Loved by Over 12,000 Families
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
              Read how couples, parents, and event planners brought their celebrations to life.
            </p>
          </Reveal>
        </div>
        <TestimonialsSection />
      </section>

      {/* Final Call To Action */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <CtaBanner />
      </section>
    </PublicPageShell>
  );
}

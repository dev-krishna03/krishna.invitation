import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/motion/Reveal";
import { OccasionsGrid } from "@/components/landing/OccasionsGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedGrid } from "@/components/landing/FeaturedGrid";
import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

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
    thumbnail_url: t.thumbnail_url,
    from: t.pricing[0] ? { price: t.pricing[0].price, days: t.pricing[0].duration_days } : undefined,
  }));

  return (
    <PublicPageShell>
      {/* Hero Section - Balcony Inspired Simple & Elegant */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24">
        {/* Soft dusk radial background glow */}
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F5F1FE] via-[#EDE4FD]/35 to-transparent blur-3xl opacity-80" />

        <div className="relative mx-auto max-w-[1120px] px-6 text-center">
          {/* Trust Pill Badge */}
          <Reveal delay={0}>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E5D9FC] bg-[#F5F1FE] px-4 py-1.5 text-xs font-semibold text-[#6520EE] shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#6520EE]" />
              <span>Make your first impression unforgettable</span>
              <span className="text-[#BDA0F8]">•</span>
              <span className="text-[#12042F] font-bold">Digital Website Invites 💜</span>
            </div>
          </Reveal>

          {/* Main Headline */}
          <Reveal delay={0.1}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-[#12042F] sm:text-6xl sm:leading-[1.12]">
              Beautiful digital website invites for every{" "}
              <span className="text-[#6520EE]">celebration.</span>
            </h1>
          </Reveal>

          {/* Subheading */}
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg text-stone-600 leading-relaxed">
              Create an elegant interactive invitation website with your love story, multi-event schedules, 
              background music, 1-tap Google Maps, and personalised links sent directly on WhatsApp.
            </p>
          </Reveal>

          {/* CTA Buttons */}
          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 rounded-full bg-[#6520EE] hover:bg-[#5213D2] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#6520EE]/25 hover:shadow-xl hover:shadow-[#6520EE]/35 transition-all hover:scale-[1.02] cursor-pointer no-underline"
              >
                <span>View templates</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5D9FC] bg-white hover:bg-[#F5F1FE] px-6 py-3.5 text-sm font-bold text-[#12042F] transition-all hover:scale-[1.02] cursor-pointer no-underline shadow-sm"
              >
                <span>Pay-by-days pricing</span>
              </Link>
            </div>
          </Reveal>

          {/* Feature Highlights Pills */}
          <Reveal delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold text-stone-600">
              <span className="rounded-full bg-white border border-[#E5D9FC] px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span className="text-[#6520EE] font-bold">✓</span> Personalised WhatsApp links
              </span>
              <span className="rounded-full bg-white border border-[#E5D9FC] px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span className="text-[#6520EE] font-bold">✓</span> Real-time RSVP tracking
              </span>
              <span className="rounded-full bg-white border border-[#E5D9FC] px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span className="text-[#6520EE] font-bold">✓</span> 1-Tap Google Maps & Calendar
              </span>
              <span className="rounded-full bg-white border border-[#E5D9FC] px-3.5 py-1.5 flex items-center gap-1.5 shadow-xs">
                <span className="text-[#6520EE] font-bold">✓</span> No guest login required
              </span>
            </div>
          </Reveal>

          {/* Interactive Live Mockup Showcase */}
          <Reveal delay={0.5}>
            <div className="mt-12">
              <HeroShowcase />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Templates Showcase */}
      {featuredItems.length > 0 && (
        <section id="templates" className="mx-auto max-w-[1120px] px-6 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Reveal>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
                  Templates
                </span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl text-[#12042F]">
                  Curated Digital Invitation Designs
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-stone-600">
                  Palace garden doors, Shehnai audio, reveal dates, and interactive RSVP flows.
                </p>
              </Reveal>
            </div>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6520EE] hover:underline transition-colors no-underline"
            >
              <span>View all templates</span>
              <span>→</span>
            </Link>
          </div>
          <FeaturedGrid items={featuredItems} />
        </section>
      )}

      {/* Sharing & Personalised Links Section */}
      <section id="sharing" className="border-y border-[#E5D9FC]/60 bg-[#FAF9FD] py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
                WhatsApp Sharing
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-4xl text-[#12042F]">
                Send each guest their own personalised link
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
                When Sharma Family opens their link, the website greets them with 
                <span className="font-semibold text-[#12042F]"> &ldquo;Dear Mr. Sharma &amp; Family&rdquo;</span>.
                Or send a single common link to everyone.
              </p>
            </Reveal>
          </div>
          <FeaturesSection />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="features" className="mx-auto max-w-[1120px] px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
              How it works
            </span>
            <h2 className="mt-3 text-2xl font-bold sm:text-4xl text-[#12042F]">
              Ready to send in under 5 minutes
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600">
              No design experience required. Pick a design, enter your details, pay by validity days, and share.
            </p>
          </Reveal>
        </div>
        <HowItWorks />
      </section>

      {/* Occasions Section */}
      <section className="border-t border-[#E5D9FC]/60 bg-[#FAF9FD] py-20">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Reveal>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
                Occasions
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-4xl text-[#12042F]">
                Digital invites for every milestone
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-stone-600">
                From grand wedding pheras and engagement rokas to birthday parties and housewarmings.
              </p>
            </Reveal>
          </div>
          <OccasionsGrid items={occasions} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-[1120px] px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
              Host stories
            </span>
            <h2 className="mt-3 text-2xl font-bold sm:text-4xl text-[#12042F]">
              Loved by couples and event hosts
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-stone-600">
              See what families say about their Balcony-style digital invitations.
            </p>
          </Reveal>
        </div>
        <TestimonialsSection />
      </section>

      {/* Final Call To Action */}
      <section className="mx-auto max-w-[1120px] px-6 pb-20">
        <CtaBanner />
      </section>
    </PublicPageShell>
  );
}

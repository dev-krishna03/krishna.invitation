import { prisma } from "@/lib/prisma";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { PricingView } from "@/components/pricing/PricingView";
import { Reveal } from "@/components/motion/Reveal";
import { Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Pricing & Plans • Krishna Invitations",
  description: "Transparent, one-time payment pricing for individual invitations, and subscriptions for event planners.",
};

export default async function PricingPage() {
  const [templates, plans] = await Promise.all([
    prisma.template.findMany({
      where: { is_active: true },
      include: { pricing: { where: { is_active: true }, orderBy: { duration_days: "asc" } } },
      orderBy: { sort_order: "asc" },
    }),
    prisma.subscriptionPlan.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
  ]);

  const templateItems = templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    pricing: t.pricing.map((p) => ({ duration_days: p.duration_days, price: p.price })),
  }));

  const planItems = plans.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    price: p.price,
    billing_period: p.billing_period,
    max_members: p.max_members,
    max_invitations: p.max_invitations,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
  }));

  return (
    <PublicPageShell>
      <main className="mx-auto max-w-6xl px-6 py-14">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Simple, Transparent Pricing</span>
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl text-stone-900">
              Celebration Plans & Pricing
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Pay once per event with zero recurring surprises, or subscribe as an agency or planner.
            </p>
          </div>
        </Reveal>

        <PricingView templates={templateItems} plans={planItems} />
      </main>
    </PublicPageShell>
  );
}

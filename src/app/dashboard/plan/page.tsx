import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureCreatorSubscription } from "@/lib/workspace";
import { PlanCards } from "./PlanCards";

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/plan");

  const [{ plan: current }, plans] = await Promise.all([
    ensureCreatorSubscription(user.id),
    prisma.creatorPlan.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Creator plans
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Different plans unlock different pricing, limits, and marketplace fees.
        </p>
      </div>
      <PlanCards
        currentTier={current.tier}
        plans={plans.map((p) => ({
          id: p.id,
          slug: p.slug,
          tier: p.tier,
          name: p.name,
          tagline: p.tagline,
          monthly_price: p.monthly_price,
          yearly_price: p.yearly_price,
          currency: p.currency,
          platform_fee_pct: p.platform_fee_pct,
          max_templates_for_sale: p.max_templates_for_sale,
          max_live_invitations: p.max_live_invitations,
          can_sell: p.can_sell,
          white_label: p.white_label,
          features: (p.features as string[]) ?? [],
        }))}
      />
    </div>
  );
}

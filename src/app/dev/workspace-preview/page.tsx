import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlanCards } from "@/app/dashboard/plan/PlanCards";

// Dev-only preview of the Creator Plans selector without Supabase auth.
export default async function Preview() {
  if (process.env.NODE_ENV === "production") notFound();
  const plans = await prisma.creatorPlan.findMany({ where: { is_active: true }, orderBy: { sort_order: "asc" } });
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
        Dev preview — real page is <code>/dashboard/plan</code> (sign-in required).
      </div>
      <PlanCards
        currentTier="FREE"
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
    </main>
  );
}

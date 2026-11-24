import { prisma } from "@/lib/prisma";
import { CreatorPlansAdmin } from "./CreatorPlansAdmin";

export default async function AdminCreatorPlansPage() {
  const plans = await prisma.creatorPlan.findMany({ orderBy: { sort_order: "asc" } });
  return (
    <main className="p-8">
      <div>
        <h1 className="text-2xl font-semibold">Creator Plans</h1>
        <p className="mt-1 text-sm text-stone-600">
          Set the pricing tiers your creators choose from. Fees apply to future sales immediately.
        </p>
      </div>
      <div className="mt-6">
        <CreatorPlansAdmin
          plans={plans.map((p) => ({
            id: p.id,
            tier: p.tier,
            slug: p.slug,
            name: p.name,
            tagline: p.tagline,
            monthly_price: p.monthly_price,
            yearly_price: p.yearly_price,
            currency: p.currency,
            platform_fee_pct: p.platform_fee_pct,
            max_templates_free: p.max_templates_free,
            extra_template_price: p.extra_template_price,
            max_templates_for_sale: p.max_templates_for_sale,
            max_live_invitations: p.max_live_invitations,
            can_sell: p.can_sell,
            white_label: p.white_label,
            features: (p.features as string[]) ?? [],
            is_active: p.is_active,
          }))}
        />
      </div>
    </main>
  );
}

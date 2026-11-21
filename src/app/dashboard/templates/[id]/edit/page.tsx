import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureCreatorSubscription } from "@/lib/workspace";
import { TemplateEditor } from "./TemplateEditor";

export default async function TemplateEditPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/templates");
  const { id } = await params;
  const template = await prisma.template.findUnique({ where: { id } });
  if (!template || template.owner_user_id !== user.id) notFound();
  const { plan } = await ensureCreatorSubscription(user.id);

  return (
    <div className="space-y-6">
      <a href="/dashboard/templates" className="text-xs font-semibold text-stone-500">← Back to templates</a>
      <TemplateEditor
        canSell={plan.can_sell}
        feePct={plan.platform_fee_pct}
        template={{
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          event_types: template.event_types,
          is_in_marketplace: template.is_in_marketplace,
          price: template.price,
          price_usd: template.price_usd,
          currency: template.currency,
          sales_count: template.sales_count,
          revenue_total: template.revenue_total,
          moderation_status: template.moderation_status,
          moderation_notes: template.moderation_notes,
        }}
      />
    </div>
  );
}

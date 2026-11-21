import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureCreatorSubscription } from "@/lib/workspace";
import { Edit3, Tag, Store, Lock, PlusCircle } from "lucide-react";
import { TemplateRow } from "./TemplateRow";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/templates");

  const [templates, { plan }] = await Promise.all([
    prisma.template.findMany({
      where: { owner_user_id: user.id },
      orderBy: { updated_at: "desc" },
    }),
    ensureCreatorSubscription(user.id),
  ]);

  const liveCount = templates.filter((t) => t.is_in_marketplace).length;
  const limit = plan.max_templates_for_sale;
  const canSell = plan.can_sell;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            My Templates
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Set a price, toggle marketplace listing, and track sales.
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/15"
        >
          <PlusCircle className="h-4 w-4" />
          New Template
        </Link>
      </div>

      {/* Plan context strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs">
        <span className="rounded-full bg-white px-2.5 py-1 font-bold text-stone-800 border border-stone-200">
          {plan.name}
        </span>
        <span className="inline-flex items-center gap-1 text-stone-600">
          <Store className="h-3.5 w-3.5" />
          {limit === null ? `Unlimited listings` : `${liveCount} / ${limit} listed`}
        </span>
        <span className="inline-flex items-center gap-1 text-stone-600">
          <Tag className="h-3.5 w-3.5" />
          {plan.platform_fee_pct}% platform fee
        </span>
        {!canSell && (
          <span className="inline-flex items-center gap-1 text-rose-700">
            <Lock className="h-3.5 w-3.5" />
            Upgrade to Creator Pro to list templates for sale.
          </span>
        )}
        <Link href="/dashboard/plan" className="ml-auto text-[11px] font-bold text-rose-700">
          Plans & pricing →
        </Link>
      </div>

      {/* List */}
      {templates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 text-rose-700">
            <Edit3 className="h-7 w-7" />
          </div>
          <h3 className="mt-4 font-serif text-xl font-bold text-stone-900">No templates yet</h3>
          <p className="mt-1 text-xs text-stone-500 max-w-xs mx-auto">
            Build one from scratch, import a community design, or save one of your invitations as a reusable template.
          </p>
          <Link
            href="/dashboard/templates/new"
            className="mt-6 inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white"
          >
            Create your first template
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div className="hidden grid-cols-[1fr_120px_160px_120px_140px] gap-3 border-b border-stone-200 bg-stone-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-stone-500 md:grid">
            <span>Template</span>
            <span>Status</span>
            <span>Price</span>
            <span>Sales</span>
            <span className="text-right">Actions</span>
          </div>
          <ul>
            {templates.map((t) => (
              <TemplateRow
                key={t.id}
                template={{
                  id: t.id,
                  name: t.name,
                  slug: t.slug,
                  category: t.category,
                  source: t.source,
                  is_in_marketplace: t.is_in_marketplace,
                  price: t.price,
                  currency: t.currency,
                  sales_count: t.sales_count,
                  revenue_total: t.revenue_total,
                }}
                canSell={canSell}
                feePct={plan.platform_fee_pct}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

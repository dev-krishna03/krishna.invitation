import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getWorkspaceSummary } from "@/lib/workspace";
import {
  Rocket, FilePlus2, ShoppingBag, Save as SaveIcon, Crown, TrendingUp, Layers, Sparkles, ArrowRight, BadgeCheck,
} from "lucide-react";
import { CreatorPlanTier } from "@prisma/client";
import { CreatorWalletCard } from "@/components/workspace/CreatorWalletCard";
import { CreatorPayoutProfileCard } from "@/components/workspace/CreatorPayoutProfileCard";
import { CreatorCouponsCard } from "@/components/workspace/CreatorCouponsCard";
import { CreatorProfileCard } from "@/components/workspace/CreatorProfileCard";

export default async function WorkspacePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/workspace");

  const [summary, dbUser] = await Promise.all([
    getWorkspaceSummary(user.id),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, name: true, avatar_url: true, role: true },
    }),
  ]);
  const recentSales = await prisma.templatePurchase.findMany({
    where: { template: { owner_user_id: user.id } },
    orderBy: { created_at: "desc" },
    take: 5,
    include: { template: { select: { name: true } }, buyer: { select: { name: true, email: true } } },
  });
  const inr = (n: number) => `₹${n.toLocaleString()}`;

  const planTone: Record<CreatorPlanTier, string> = {
    FREE: "from-stone-100 to-stone-200 text-stone-800 border-stone-300",
    PRO: "from-violet-100 to-purple-100 text-violet-800 border-violet-200",
    STUDIO: "from-amber-200 to-amber-100 text-amber-900 border-amber-300",
    ZERO_FEE: "from-emerald-100 to-teal-100 text-emerald-900 border-emerald-300",
    ENTERPRISE: "from-indigo-100 to-violet-100 text-indigo-900 border-indigo-300",
    CUSTOM: "from-purple-100 to-fuchsia-100 text-purple-900 border-purple-300",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            {dbUser?.avatar_url ? (
              <img
                src={dbUser.avatar_url}
                alt={dbUser.name || "Studio Avatar"}
                className="h-16 w-16 rounded-full object-cover border-2 border-rose-300 shadow-sm"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 font-serif text-xl font-bold text-white shadow-sm">
                {(dbUser?.name || user.email?.split("@")[0] || "C").slice(0, 1).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] ring-2 ring-white">
              ✓
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-rose-700">
              <Rocket className="h-3 w-3" />
              Your Workspace
            </div>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {dbUser?.name || user.email?.split("@")[0]}&apos;s Studio
            </h1>
            <p className="mt-0.5 text-xs text-stone-500">
              Create templates, import from the community, and set your own prices.
            </p>
          </div>
        </div>
        <div className={`rounded-2xl border bg-gradient-to-br px-4 py-3 shadow-sm ${planTone[summary.plan.tier]}`}>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide">
            <Crown className="h-3.5 w-3.5" />
            Current Plan
          </div>
          <p className="mt-1 font-serif text-lg font-bold">{summary.plan.name}</p>
          <p className="text-[11px] opacity-80">
            {summary.plan.tier === "FREE"
              ? `${summary.templates.total} / ${summary.plan.max_templates_free ?? 5} Free Templates Used · ${summary.plan.platform_fee_pct}% fee`
              : `${summary.plan.platform_fee_pct}% platform fee · ${
                  summary.plan.max_templates_for_sale === null
                    ? "Unlimited slots"
                    : `${summary.plan.max_templates_for_sale} slots`
                }`}
          </p>
          <Link
            href="/dashboard/plan"
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/70 px-2.5 py-1 text-[11px] font-bold hover:bg-white"
          >
            Change plan
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat tone="rose" icon={Layers} label="Templates" value={summary.templates.total} caption={`${summary.templates.live} on sale`} />
        <Stat tone="amber" icon={BadgeCheck} label="Sales" value={summary.templates.sales_count} caption="all-time units sold" />
        <Stat tone="emerald" icon={TrendingUp} label="Revenue" value={inr(summary.templates.revenue_total)} caption="gross, before fees" />
        <Stat tone="sky" icon={Sparkles} label="Live Invitations" value={summary.invitations.live} caption={`${summary.invitations.total} total`} />
      </div>

      {/* Creator Profile & Picture Management */}
      <CreatorProfileCard initialUser={dbUser || { id: user.id, email: user.email }} />

      {/* Creator Marketplace Wallet (90% Earnings / 10% Platform Fee) */}
      <CreatorWalletCard
        availableAmount={Math.max(1200, Math.round((summary.templates.revenue_total || 0) * 0.9 * 0.7))}
        pendingHoldAmount={Math.round((summary.templates.revenue_total || 0) * 0.9 * 0.3)}
        totalEarnedAmount={Math.round((summary.templates.revenue_total || 0) * 0.9)}
      />

      {/* Creator Bank Account & UPI Settlement */}
      <CreatorPayoutProfileCard />

      {/* Creator Coupons & Discounts */}
      <CreatorCouponsCard />

      {/* Quick actions */}
      <section>
        <h2 className="font-serif text-lg font-bold text-stone-900">Quick actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/dashboard/templates/new?source=blank"
            icon={FilePlus2}
            title="Create Template"
            caption="Start from a blank design."
            tone="rose"
          />
          <QuickAction
            href="/dashboard/templates/new?source=community"
            icon={ShoppingBag}
            title="Import from Community"
            caption="Fork a listed template into your workspace."
            tone="amber"
          />
          <QuickAction
            href="/dashboard/templates/new?source=invitation"
            icon={SaveIcon}
            title="Save Invitation as Template"
            caption="Reuse something you already designed."
            tone="sky"
          />
        </div>
      </section>

      {/* Recent sales */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-stone-900">Recent sales</h2>
          <Link href="/dashboard/templates" className="text-xs font-bold text-rose-700">
            Manage templates
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-stone-300 bg-white/70 p-6 text-center">
            <p className="text-xs text-stone-500">
              No sales yet. List a template on the marketplace from{" "}
              <Link href="/dashboard/templates" className="underline">
                My Templates
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-2xl border border-stone-200 bg-white">
            {recentSales.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <p className="font-semibold text-stone-900">{p.template.name}</p>
                  <p className="text-[11px] text-stone-500">
                    {p.buyer.name ?? p.buyer.email} · {p.created_at.toISOString().slice(0, 10)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-base font-bold text-stone-900">{inr(p.gross_amount)}</p>
                  <p className="text-[11px] text-emerald-700">
                    + {inr(p.seller_amount)} to you
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ tone, icon: Icon, label, value, caption }: {
  tone: "rose" | "amber" | "emerald" | "sky";
  icon: React.ElementType;
  label: string;
  value: string | number;
  caption: string;
}) {
  const toneMap = {
    rose: "from-rose-50 to-amber-50 text-rose-700 border-rose-200",
    amber: "from-amber-50 to-orange-50 text-amber-700 border-amber-200",
    emerald: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-200",
    sky: "from-sky-50 to-indigo-50 text-sky-700 border-sky-200",
  }[tone];
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 ${toneMap}`}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/80">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-stone-600">{label}</span>
      </div>
      <p className="mt-3 font-serif text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-[11px] text-stone-500">{caption}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, title, caption, tone }: {
  href: string;
  icon: React.ElementType;
  title: string;
  caption: string;
  tone: "rose" | "amber" | "sky";
}) {
  const toneMap = {
    rose: "border-rose-200 bg-rose-50/60 text-rose-700",
    amber: "border-amber-200 bg-amber-50/60 text-amber-700",
    sky: "border-sky-200 bg-sky-50/60 text-sky-700",
  }[tone];
  return (
    <Link href={href} className={`group block rounded-2xl border p-4 transition-all hover:shadow-md hover:shadow-rose-900/5 ${toneMap}`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/80">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-serif text-base font-bold text-stone-900">{title}</p>
      <p className="text-xs text-stone-600">{caption}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold">
        Start
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}

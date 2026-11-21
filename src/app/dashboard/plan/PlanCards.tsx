"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, Loader2 } from "lucide-react";

type PlanVM = {
  id: string;
  slug: string;
  tier: "FREE" | "PRO" | "STUDIO";
  name: string;
  tagline: string | null;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  platform_fee_pct: number;
  max_templates_for_sale: number | null;
  max_live_invitations: number | null;
  can_sell: boolean;
  white_label: boolean;
  features: string[];
};

export function PlanCards({ currentTier, plans }: { currentTier: string; plans: PlanVM[] }) {
  const router = useRouter();
  const [billing, setBilling] = useState<"MONTHLY" | "YEARLY">("YEARLY");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(tier: string) {
    setBusy(tier);
    setError(null);
    const res = await fetch("/api/workspace/plan", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tier, billing }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    router.push("/dashboard/workspace");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Billing toggle */}
      <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 text-xs font-bold">
        {(["MONTHLY", "YEARLY"] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={`rounded-full px-4 py-1.5 transition-all ${
              billing === b ? "bg-stone-900 text-white" : "text-stone-600"
            }`}
          >
            {b === "YEARLY" ? "Yearly · save 2 months" : "Monthly"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((p) => {
          const price = billing === "YEARLY" ? p.yearly_price : p.monthly_price;
          const label = billing === "YEARLY" ? "/ year" : "/ month";
          const isCurrent = p.tier === currentTier;
          const isElite = p.tier === "STUDIO";
          return (
            <motion.div
              key={p.tier}
              whileHover={{ y: -4 }}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm transition-all ${
                isElite
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 via-white to-rose-50"
                  : p.tier === "PRO"
                    ? "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-white"
                    : "border-stone-200 bg-white"
              }`}
            >
              {isElite && (
                <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  <Crown className="h-3 w-3" /> Best for agencies
                </span>
              )}
              <h3 className="font-serif text-xl font-bold text-stone-900">{p.name}</h3>
              <p className="mt-1 text-xs text-stone-500">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-serif text-3xl font-bold text-stone-900">
                  {p.currency === "INR" ? "₹" : p.currency}{price.toLocaleString()}
                </span>
                <span className="text-xs text-stone-500">{price === 0 ? "forever" : label}</span>
              </div>
              <ul className="mt-5 space-y-2 text-xs">
                <Row ok icon>Platform fee: <b>{p.platform_fee_pct}%</b></Row>
                <Row ok={p.can_sell} icon>
                  {p.can_sell ? `Sell up to ${p.max_templates_for_sale === null ? "unlimited" : p.max_templates_for_sale} templates` : "Selling not included"}
                </Row>
                <Row ok icon>
                  {p.max_live_invitations === null ? "Unlimited live invitations" : `${p.max_live_invitations} live invitations`}
                </Row>
                <Row ok={p.white_label} icon>
                  {p.white_label ? "White-label links & branding" : "Standard branding"}
                </Row>
                {p.features.map((f) => (
                  <Row key={f} ok icon>{f}</Row>
                ))}
              </ul>
              <button
                onClick={() => choose(p.tier)}
                disabled={busy !== null || isCurrent}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold ${
                  isCurrent
                    ? "bg-stone-100 text-stone-600 border border-stone-200"
                    : "bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md shadow-rose-900/15 hover:brightness-105"
                }`}
              >
                {busy === p.tier ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isCurrent ? "Current plan" : busy === p.tier ? "Switching…" : `Switch to ${p.name}`}
              </button>
            </motion.div>
          );
        })}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function Row({ children, ok, icon }: { children: React.ReactNode; ok: boolean; icon?: boolean }) {
  return (
    <li className={`flex items-start gap-2 ${ok ? "text-stone-700" : "text-stone-400 line-through"}`}>
      {icon && <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 ${ok ? "text-emerald-600" : "text-stone-300"}`} />}
      <span>{children}</span>
    </li>
  );
}

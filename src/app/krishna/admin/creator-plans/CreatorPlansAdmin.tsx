"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";

type PlanVM = {
  id: string;
  tier: string;
  slug: string;
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
  is_active: boolean;
};

export function CreatorPlansAdmin({ plans }: { plans: PlanVM[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((p) => <PlanEditor key={p.id} initial={p} />)}
    </div>
  );
}

function PlanEditor({ initial }: { initial: PlanVM }) {
  const [p, setP] = useState(initial);
  const [featuresText, setFeaturesText] = useState(initial.features.join("\n"));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function num(v: string): number {
    const n = parseInt(v || "0", 10);
    return Number.isNaN(n) ? 0 : n;
  }
  function nullableNum(v: string): number | null {
    if (v.trim() === "" || v.trim().toLowerCase() === "unlimited") return null;
    return num(v);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const body = {
      name: p.name,
      tagline: p.tagline,
      monthly_price: p.monthly_price,
      yearly_price: p.yearly_price,
      platform_fee_pct: p.platform_fee_pct,
      max_templates_for_sale: p.max_templates_for_sale,
      max_live_invitations: p.max_live_invitations,
      can_sell: p.can_sell,
      white_label: p.white_label,
      is_active: p.is_active,
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    const res = await fetch(`/api/admin/creator-plans/${p.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    setSaved(new Date().toLocaleTimeString());
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-700">
          {p.tier}
        </span>
        <label className="flex items-center gap-1 text-[11px]">
          <input
            type="checkbox"
            checked={p.is_active}
            onChange={(e) => setP({ ...p, is_active: e.target.checked })}
          />
          Active
        </label>
      </div>
      <div className="mt-3 space-y-3">
        <Field label="Name">
          <input value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
        </Field>
        <Field label="Tagline">
          <input value={p.tagline ?? ""} onChange={(e) => setP({ ...p, tagline: e.target.value })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Monthly (₹)">
            <input type="number" min={0} value={p.monthly_price} onChange={(e) => setP({ ...p, monthly_price: num(e.target.value) })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
          </Field>
          <Field label="Yearly (₹)">
            <input type="number" min={0} value={p.yearly_price} onChange={(e) => setP({ ...p, yearly_price: num(e.target.value) })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Fee %">
            <input type="number" min={0} max={100} value={p.platform_fee_pct} onChange={(e) => setP({ ...p, platform_fee_pct: num(e.target.value) })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
          </Field>
          <Field label="Sale slots (blank = ∞)">
            <input value={p.max_templates_for_sale ?? ""} onChange={(e) => setP({ ...p, max_templates_for_sale: nullableNum(e.target.value) })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
          </Field>
        </div>
        <Field label="Max live invitations (blank = ∞)">
          <input value={p.max_live_invitations ?? ""} onChange={(e) => setP({ ...p, max_live_invitations: nullableNum(e.target.value) })} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
        </Field>
        <div className="flex gap-3 text-[11px]">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={p.can_sell} onChange={(e) => setP({ ...p, can_sell: e.target.checked })} />
            Can sell
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={p.white_label} onChange={(e) => setP({ ...p, white_label: e.target.checked })} />
            White-label
          </label>
        </div>
        <Field label="Features (one per line)">
          <textarea value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} className="h-24 w-full rounded-md border border-stone-300 px-2 py-1 text-xs" />
        </Field>
        {error && <p className="text-[11px] text-rose-600">{error}</p>}
        {saved && <p className="text-[11px] text-emerald-700">Saved at {saved}</p>}
        <motion.button whileTap={{ scale: 0.97 }} onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-60">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save plan
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

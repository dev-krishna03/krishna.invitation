"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  Sparkles,
  Crown,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  ShieldCheck,
  Zap,
} from "lucide-react";

export type PlanVM = {
  id: string;
  tier: string;
  slug: string;
  name: string;
  tagline: string | null;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  platform_fee_pct: number;
  max_templates_free: number | null;
  extra_template_price: number;
  max_templates_for_sale: number | null;
  max_live_invitations: number | null;
  can_sell: boolean;
  white_label: boolean;
  features: string[];
  is_active: boolean;
};

export function CreatorPlansAdmin({ plans: initialPlans }: { plans: PlanVM[] }) {
  const [plans, setPlans] = useState<PlanVM[]>(initialPlans);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Starting Plan Info Header & Create Button */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-gradient-to-r from-[#FAF9FD] via-white to-[#F5F1FE] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6520EE] text-white shadow-xs">
              <Crown className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#12042F]">
                Creator Plans &amp; Custom Platform Fee Architecture
              </h2>
              <p className="text-xs text-[#7A7387] max-w-2xl mt-0.5 leading-relaxed">
                Control starter allowances (first 5 free templates), or configure <strong>0% Platform Fee</strong> plans
                where creators keep 100% of their earnings for a fixed subscription fee.
              </p>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#6520EE] hover:bg-[#5218c5] px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-colors self-start md:self-center"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Creator Plan</span>
          </motion.button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((p) => (
          <PlanEditor key={p.id} initial={p} />
        ))}
      </div>

      {/* Create New Plan Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePlanModal
            onClose={() => setShowCreateModal(false)}
            onCreated={(newPlan) => {
              setPlans((prev) => [...prev, newPlan]);
              setShowCreateModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreatePlanModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (plan: PlanVM) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tier, setTier] = useState<string>("ZERO_FEE");
  const [tagline, setTagline] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState(1499);
  const [yearlyPrice, setYearlyPrice] = useState(14999);
  const [platformFeePct, setPlatformFeePct] = useState(0); // Default to 0% fee!
  const [maxTemplatesFree, setMaxTemplatesFree] = useState<number | null>(null);
  const [extraTemplatePrice, setExtraTemplatePrice] = useState(0);
  const [canSell, setCanSell] = useState(true);
  const [whiteLabel, setWhiteLabel] = useState(true);
  const [featuresText, setFeaturesText] = useState(
    "0% Platform Commission — Keep 100% of Template Earnings\nUnlimited Template Publishing\nFull White-label Branding\nPriority 24hr Bank IMPS & UPI Payouts\nDedicated Account Manager",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(preset: "zero_fee" | "custom") {
    if (preset === "zero_fee") {
      setName("Studio VIP (Zero Commission)");
      setSlug("studio-zero-fee");
      setTier("ZERO_FEE");
      setPlatformFeePct(0);
      setMonthlyPrice(1499);
      setYearlyPrice(14999);
      setMaxTemplatesFree(null);
      setWhiteLabel(true);
      setFeaturesText(
        "0% Platform Commission — Keep 100% of Template Earnings\nUnlimited Template Publishing\nFull White-label Branding\nPriority 24hr Bank IMPS & UPI Payouts\nDedicated Account Manager",
      );
    } else if (preset === "custom") {
      setName("Agency Partner Plan");
      setSlug("agency-partner");
      setTier("CUSTOM");
      setPlatformFeePct(5);
      setMonthlyPrice(2999);
      setYearlyPrice(29999);
      setMaxTemplatesFree(null);
      setWhiteLabel(true);
      setFeaturesText(
        "5% Reduced Platform Commission\nUnlimited Client Sub-accounts\nCustom Domain Support\nCentral Multi-Client Billing",
      );
    }
  }

  async function submit() {
    if (!name.trim() || !slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/creator-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          tier,
          tagline: tagline || null,
          monthly_price: monthlyPrice,
          yearly_price: yearlyPrice,
          platform_fee_pct: platformFeePct,
          max_templates_free: maxTemplatesFree,
          extra_template_price: extraTemplatePrice,
          can_sell: canSell,
          white_label: whiteLabel,
          features: featuresText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create plan");
        return;
      }
      onCreated({
        id: data.plan.id,
        tier: data.plan.tier,
        slug: data.plan.slug,
        name: data.plan.name,
        tagline: data.plan.tagline,
        monthly_price: data.plan.monthly_price,
        yearly_price: data.plan.yearly_price,
        currency: data.plan.currency,
        platform_fee_pct: data.plan.platform_fee_pct,
        max_templates_free: data.plan.max_templates_free,
        extra_template_price: data.plan.extra_template_price,
        max_templates_for_sale: data.plan.max_templates_for_sale,
        max_live_invitations: data.plan.max_live_invitations,
        can_sell: data.plan.can_sell,
        white_label: data.plan.white_label,
        features: (data.plan.features as string[]) ?? [],
        is_active: data.plan.is_active,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-[#E5D9FC] overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4 bg-[#FAF9FD]">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6520EE] text-white">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="text-base font-bold text-[#12042F]">Create New Creator Plan</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-stone-500">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset("zero_fee")}
              className="rounded-full bg-[#F5F1FE] border border-[#E5D9FC] px-3 py-1 font-bold text-[#6520EE] hover:bg-[#E5D9FC] transition-colors"
            >
              ⭐ 0% Platform Fee (VIP)
            </button>
            <button
              type="button"
              onClick={() => applyPreset("custom")}
              className="rounded-full bg-stone-100 border border-stone-200 px-3 py-1 font-bold text-stone-700 hover:bg-stone-200 transition-colors"
            >
              🏢 Agency Partner (5%)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan Name">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                }}
                placeholder="e.g. Studio VIP (Zero Commission)"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-900"
              />
            </Field>
            <Field label="Unique Slug">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-"))}
                placeholder="e.g. studio-zero-fee"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Plan Tier">
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-900 bg-white"
              >
                <option value="ZERO_FEE">ZERO_FEE (0% Fee Plan)</option>
                <option value="PRO">PRO</option>
                <option value="STUDIO">STUDIO</option>
                <option value="CUSTOM">CUSTOM</option>
                <option value="ENTERPRISE">ENTERPRISE</option>
                <option value="FREE">FREE</option>
              </select>
            </Field>
            <Field label="Platform Fee Percentage (%)">
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={platformFeePct}
                  onChange={(e) => setPlatformFeePct(parseInt(e.target.value || "0", 10))}
                  className="w-full rounded-xl border border-[#E5D9FC] bg-[#F5F1FE]/50 px-3 py-2 text-xs font-bold text-[#6520EE]"
                />
                {platformFeePct === 0 && (
                  <span className="absolute right-2 top-2 rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[9px] font-bold">
                    0% Fee
                  </span>
                )}
              </div>
            </Field>
          </div>

          <Field label="Tagline / Short Pitch">
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Best for professional studios selling 20+ templates monthly"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Price (₹)">
              <input
                type="number"
                min={0}
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseInt(e.target.value || "0", 10))}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
              />
            </Field>
            <Field label="Yearly Price (₹)">
              <input
                type="number"
                min={0}
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(parseInt(e.target.value || "0", 10))}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
              />
            </Field>
          </div>

          <div className="flex gap-4 text-xs font-semibold text-stone-700">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={canSell}
                onChange={(e) => setCanSell(e.target.checked)}
                className="rounded accent-[#6520EE]"
              />
              Allow Marketplace Selling
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={whiteLabel}
                onChange={(e) => setWhiteLabel(e.target.checked)}
                className="rounded accent-[#6520EE]"
              />
              White-label Branding Included
            </label>
          </div>

          <Field label="Included Features (one per line)">
            <textarea
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800"
            />
          </Field>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-stone-100 px-6 py-4 bg-[#FAF9FD]">
          <button
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-xl bg-[#6520EE] hover:bg-[#5218c5] px-5 py-2 text-xs font-bold text-white shadow-xs disabled:opacity-60 transition-colors"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Publish Creator Plan
          </button>
        </div>
      </motion.div>
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
      max_templates_free: p.max_templates_free,
      extra_template_price: p.extra_template_price,
      max_templates_for_sale: p.max_templates_for_sale,
      max_live_invitations: p.max_live_invitations,
      can_sell: p.can_sell,
      white_label: p.white_label,
      is_active: p.is_active,
      features: featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch(`/api/admin/creator-plans/${p.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed to save plan");
      return;
    }
    setSaved(new Date().toLocaleTimeString());
    setTimeout(() => setSaved(null), 4000);
  }

  const isFree = p.tier === "FREE";
  const isZeroFee = p.platform_fee_pct === 0;

  return (
    <div
      className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
        isZeroFee
          ? "border-emerald-300 ring-2 ring-emerald-50"
          : isFree
          ? "border-violet-300 ring-2 ring-violet-50"
          : "border-stone-200"
      }`}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F5F1FE] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#6520EE]">
              {p.tier}
            </span>
            {isZeroFee && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                0% Platform Fee
              </span>
            )}
            {isFree && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Starting Plan
              </span>
            )}
          </div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 cursor-pointer">
            <input
              type="checkbox"
              checked={p.is_active}
              onChange={(e) => setP({ ...p, is_active: e.target.checked })}
              className="rounded accent-[#6520EE]"
            />
            Active Tier
          </label>
        </div>

        <div className="space-y-4">
          <Field label="Plan Display Name">
            <input
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
            />
          </Field>

          <Field label="Short Tagline">
            <input
              value={p.tagline ?? ""}
              onChange={(e) => setP({ ...p, tagline: e.target.value })}
              placeholder="e.g. For beginner designers getting started"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
            />
          </Field>

          {/* Free templates limit & Extra template slot price */}
          <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#6520EE]">
              <Sparkles className="h-3.5 w-3.5 text-[#6520EE]" />
              <span>Free Quota &amp; Additional Slot Pricing</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Free Templates (Limit)">
                <input
                  type="number"
                  min={0}
                  value={p.max_templates_free ?? ""}
                  placeholder="Unlimited"
                  onChange={(e) => setP({ ...p, max_templates_free: nullableNum(e.target.value) })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-900"
                />
              </Field>
              <Field label="Extra Slot Price (₹)">
                <input
                  type="number"
                  min={0}
                  value={p.extra_template_price}
                  onChange={(e) => setP({ ...p, extra_template_price: num(e.target.value) })}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-900"
                />
              </Field>
            </div>
            <span className="text-[10px] text-stone-500 block">
              {isFree
                ? "First 5 templates created are 100% free. Creator must upgrade or pay ₹99/slot beyond 5."
                : "Included design slots before requiring plan renewal."}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly Price (₹)">
              <input
                type="number"
                min={0}
                value={p.monthly_price}
                onChange={(e) => setP({ ...p, monthly_price: num(e.target.value) })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
              />
            </Field>
            <Field label="Yearly Price (₹)">
              <input
                type="number"
                min={0}
                value={p.yearly_price}
                onChange={(e) => setP({ ...p, yearly_price: num(e.target.value) })}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Platform Fee (%)">
              <input
                type="number"
                min={0}
                max={100}
                value={p.platform_fee_pct}
                onChange={(e) => setP({ ...p, platform_fee_pct: num(e.target.value) })}
                className={`w-full rounded-xl border px-3 py-2 text-xs font-bold ${
                  p.platform_fee_pct === 0
                    ? "border-emerald-300 text-emerald-700 bg-emerald-50/50"
                    : "border-stone-200 text-[#6520EE]"
                }`}
              />
            </Field>
            <Field label="Marketplace Slots (blank = ∞)">
              <input
                placeholder="Unlimited"
                value={p.max_templates_for_sale ?? ""}
                onChange={(e) =>
                  setP({ ...p, max_templates_for_sale: nullableNum(e.target.value) })
                }
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
              />
            </Field>
          </div>

          <div className="flex gap-4 text-xs font-semibold text-stone-700 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.can_sell}
                onChange={(e) => setP({ ...p, can_sell: e.target.checked })}
                className="rounded accent-[#6520EE]"
              />
              Allow Marketplace Selling
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={p.white_label}
                onChange={(e) => setP({ ...p, white_label: e.target.checked })}
                className="rounded accent-[#6520EE]"
              />
              White-label Branding
            </label>
          </div>

          <Field label="Included Features (one per line)">
            <textarea
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              className="h-24 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800"
            />
          </Field>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {saved && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2 text-xs text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Plan saved successfully at {saved}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-end">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#6520EE] hover:bg-[#5218c5] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-60 transition-colors"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Plan Configuration
        </motion.button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Tag, Loader2, CheckCircle2, Lock } from "lucide-react";

const CATEGORIES = ["LUXURY", "MINIMAL", "TRADITIONAL", "MODERN", "FLORAL", "RUSTIC"] as const;

export function TemplateEditor({
  template,
  canSell,
  feePct,
}: {
  template: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    event_types: string[];
    is_in_marketplace: boolean;
    price: number | null;
    currency: string;
    sales_count: number;
    revenue_total: number;
  };
  canSell: boolean;
  feePct: number;
}) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [category, setCategory] = useState(template.category);
  const [eventTypesText, setEventTypesText] = useState(template.event_types.join(", "));
  const [price, setPrice] = useState<string>(template.price?.toString() ?? "");
  const [listed, setListed] = useState(template.is_in_marketplace);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const priceNum = parseInt(price || "0", 10);
  const sellerShare = priceNum > 0 ? Math.round((priceNum * (100 - feePct)) / 100) : 0;

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/workspace/templates/${template.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        category,
        event_types: eventTypesText.split(",").map((s) => s.trim()).filter(Boolean),
        price: price ? priceNum : null,
        is_in_marketplace: listed,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="font-serif text-2xl font-bold text-stone-900">Edit template</h1>
        <p className="mt-1 text-xs text-stone-500">Metadata that buyers and your invitations will see.</p>

        <div className="mt-5 space-y-4">
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </Field>
          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Event types (comma-separated slugs)">
              <input value={eventTypesText} onChange={(e) => setEventTypesText(e.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono" />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved {savedAt}
            </span>
          )}
          <motion.button
            onClick={save}
            disabled={busy || !name}
            whileHover={!busy ? { scale: 1.02 } : undefined}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/15 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {busy ? "Saving…" : "Save changes"}
          </motion.button>
        </div>
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 font-serif text-base font-bold text-stone-900">
            <Store className="h-4 w-4" /> Marketplace
          </h3>
          {!canSell && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <Lock className="mt-0.5 h-3.5 w-3.5" />
              <span>Your current plan doesn&apos;t allow selling. Upgrade on the <a href="/dashboard/plan" className="font-bold underline">plans</a> page.</span>
            </div>
          )}
          <div className="mt-4">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-stone-500">Price (INR)</label>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-stone-500">₹</span>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              />
            </div>
            {priceNum > 0 && (
              <p className="mt-1 text-[11px] text-stone-500">
                You receive <span className="font-bold text-emerald-700">₹{sellerShare.toLocaleString()}</span> ·
                platform fee {feePct}%
              </p>
            )}
          </div>

          <label className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs">
            <span>
              <p className="font-bold text-stone-900">List in marketplace</p>
              <p className="text-[11px] text-stone-500">Other users can buy a copy.</p>
            </span>
            <button
              type="button"
              onClick={() => setListed(!listed)}
              disabled={!canSell || (!listed && !priceNum)}
              className={`inline-flex h-6 w-11 items-center rounded-full border transition-colors ${
                listed ? "bg-emerald-500 border-emerald-500" : "bg-stone-200 border-stone-200"
              } ${!canSell || (!listed && !priceNum) ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${listed ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </label>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-xs text-stone-700">
          <p className="font-bold text-stone-900">Performance</p>
          <dl className="mt-3 space-y-2">
            <Row k="Copies sold" v={template.sales_count.toString()} />
            <Row k="Gross revenue" v={`₹${template.revenue_total.toLocaleString()}`} />
            <Row k="Your fee rate" v={`${feePct}%`} />
          </dl>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-stone-500">{k}</dt>
      <dd className="font-bold text-stone-900">{v}</dd>
    </div>
  );
}

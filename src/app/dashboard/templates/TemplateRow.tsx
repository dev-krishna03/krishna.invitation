"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Edit3, Store, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

export type TemplateVM = {
  id: string;
  name: string;
  slug: string;
  category: string;
  source: string;
  thumbnail_url?: string | null;
  is_in_marketplace: boolean;
  price: number | null;
  currency: string;
  sales_count: number;
  revenue_total: number;
};

export function TemplateRow({
  template,
  canSell,
  feePct,
}: {
  template: TemplateVM;
  canSell: boolean;
  feePct: number;
}) {
  const [state, setState] = useState(template);
  const [editingPrice, setEditingPrice] = useState(false);
  const [draftPrice, setDraftPrice] = useState<string>(state.price?.toString() ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Partial<TemplateVM>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/workspace/templates/${state.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return false;
    }
    const d = (await res.json()) as { template: TemplateVM };
    setState(d.template);
    return true;
  }

  async function savePrice() {
    const n = parseInt(draftPrice || "0", 10);
    if (Number.isNaN(n) || n < 0) {
      setError("Price must be a non-negative number");
      return;
    }
    const ok = await patch({ price: n });
    if (ok) setEditingPrice(false);
  }

  async function toggleMarketplace(next: boolean) {
    if (next && !state.price) {
      setEditingPrice(true);
      setError("Set a price first.");
      return;
    }
    await patch({ is_in_marketplace: next });
  }

  const sellerShare = state.price ? Math.round((state.price * (100 - feePct)) / 100) : 0;

  return (
    <motion.li
      layout
      className="grid grid-cols-1 gap-3 border-b border-stone-100 px-4 py-4 md:grid-cols-[1fr_120px_160px_120px_140px] md:items-center"
    >
      {/* Template */}
      <div>
        <div className="flex items-center gap-3">
          {state.thumbnail_url ? (
            <img
              src={state.thumbnail_url}
              alt={state.name}
              className="h-10 w-10 shrink-0 rounded-xl object-cover border border-stone-200 shadow-2xs"
            />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-50 to-rose-50 text-rose-700 font-serif text-sm font-bold border border-rose-100">
              {state.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate font-semibold text-stone-900">{state.name}</p>
            <p className="truncate text-[11px] text-stone-500">
              {state.category.toLowerCase()} · {state.source.replace("_", " ").toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div>
        <ToggleChip
          enabled={state.is_in_marketplace}
          disabled={!canSell || busy}
          onChange={toggleMarketplace}
        />
      </div>

      {/* Price */}
      <div>
        {editingPrice ? (
          <div className="flex items-center gap-1">
            <span className="text-xs text-stone-500">₹</span>
            <input
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
              className="w-20 rounded-md border border-stone-300 bg-white px-2 py-1 text-sm"
              autoFocus
            />
            <button onClick={savePrice} disabled={busy} className="rounded-md bg-stone-900 px-2 py-1 text-[11px] font-bold text-white">
              {busy ? "…" : "Save"}
            </button>
            <button onClick={() => { setEditingPrice(false); setDraftPrice(state.price?.toString() ?? ""); }} className="text-[11px] text-stone-500">
              Cancel
            </button>
          </div>
        ) : state.price != null ? (
          <button
            onClick={() => setEditingPrice(true)}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-800 hover:border-stone-400"
          >
            <Tag className="h-3 w-3 text-stone-500" />
            ₹{state.price.toLocaleString()}
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100" />
          </button>
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-dashed border-stone-300 px-2.5 py-1 text-xs text-stone-500 hover:border-stone-400"
          >
            Set price
          </button>
        )}
        {state.price != null && (
          <p className="mt-1 text-[10px] text-stone-500">
            You keep ₹{sellerShare.toLocaleString()} after {feePct}% fee
          </p>
        )}
      </div>

      {/* Sales */}
      <div className="text-xs text-stone-600">
        <p className="font-bold text-stone-900">{state.sales_count}</p>
        <p className="text-[10px] text-stone-500">₹{state.revenue_total.toLocaleString()} gross</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1.5">
        <Link
          href={`/dashboard/templates/${state.id}/edit`}
          className="inline-flex items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-stone-700 hover:bg-stone-50"
        >
          <Edit3 className="h-3 w-3" />
          Edit
        </Link>
        {state.is_in_marketplace && (
          <Link
            href={`/community/${state.slug}`}
            className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-stone-800"
          >
            <Store className="h-3 w-3" />
            View
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {error && (
        <p className="col-span-full text-[11px] text-rose-600">{error}</p>
      )}
    </motion.li>
  );
}

function ToggleChip({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all ${
        enabled
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-stone-100 text-stone-600 border border-stone-200"
      } ${disabled ? "cursor-not-allowed opacity-60" : "hover:brightness-95"}`}
    >
      <span className={`h-2 w-2 rounded-full ${enabled ? "bg-emerald-500" : "bg-stone-400"}`} />
      {enabled ? "Listed" : "Draft"}
    </button>
  );
}

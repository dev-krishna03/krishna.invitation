"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_email: string;
  owner_name: string | null;
  price_display: string;
  usd_display: string | null;
  submitted_at: string | null;
  moderation_notes: string | null;
  moderation_status: string;
};

export function ModerationRow({ template }: { template: Template }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [visible, setVisible] = useState(true);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function act(decision: "APPROVED" | "REJECTED") {
    if (decision === "REJECTED" && !notes.trim()) {
      setError("Please note a rejection reason so the creator knows what to fix.");
      return;
    }
    setError(null);
    setState("loading");
    const res = await fetch(`/api/admin/moderation/${template.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, notes }),
    });
    if (!res.ok) {
      setState("idle");
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    setState("done");
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-stone-900 truncate">{template.name}</h3>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
              Pending
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500">
            by {template.owner_name ?? template.owner_email} · {template.price_display}
            {template.usd_display ? ` · ${template.usd_display}` : ""}
            {template.submitted_at ? ` · submitted ${template.submitted_at.slice(0, 10)}` : ""}
          </p>
          {template.description && (
            <p className="mt-2 text-xs text-stone-600 line-clamp-3">{template.description}</p>
          )}
        </div>
        <Link
          href={`/community/${template.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-md border border-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
        >
          <ExternalLink className="h-3 w-3" />
          Preview
        </Link>
      </div>

      <div className="mt-3">
        <label className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Notes (required to reject)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. 'Replace copyrighted photo in hero section.'"
          className="mt-1 h-16 w-full rounded-lg border border-stone-200 px-3 py-2 text-xs"
        />
      </div>

      {error && <p className="mt-2 text-[11px] text-rose-600">{error}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          onClick={() => act("REJECTED")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        >
          <XCircle className="h-3.5 w-3.5" />
          Reject
        </button>
        <button
          onClick={() => act("APPROVED")}
          disabled={state === "loading"}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Approve
        </button>
      </div>
    </motion.li>
  );
}

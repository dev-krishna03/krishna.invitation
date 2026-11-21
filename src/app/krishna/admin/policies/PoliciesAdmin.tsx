"use client";

import { useState } from "react";
import { Loader2, Save, ExternalLink } from "lucide-react";
import Link from "next/link";

type PolicyVM = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  version: string;
  is_published: boolean;
};

export function PoliciesAdmin({ policies }: { policies: PolicyVM[] }) {
  const [selectedId, setSelectedId] = useState(policies[0]?.id ?? "");
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <ul className="space-y-1 rounded-xl border border-stone-200 bg-white p-2">
        {policies.map((p) => (
          <li key={p.id}>
            <button
              onClick={() => setSelectedId(p.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                selectedId === p.id ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              <span className="font-semibold">{p.title}</span>
              <span className="ml-2 text-[10px] opacity-70">v{p.version}</span>
              {!p.is_published && <span className="ml-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] text-amber-800">Hidden</span>}
            </button>
          </li>
        ))}
      </ul>

      {policies.map((p) =>
        p.id === selectedId ? <PolicyEditor key={p.id} initial={p} /> : null,
      )}
    </div>
  );
}

function PolicyEditor({ initial }: { initial: PolicyVM }) {
  const [p, setP] = useState(initial);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/policies/${p.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: p.title,
        summary: p.summary,
        content: p.content,
        version: p.version,
        is_published: p.is_published,
      }),
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
        <div>
          <p className="text-[10px] uppercase tracking-wide text-stone-500">Slug</p>
          <p className="font-mono text-xs text-stone-800">{p.slug}</p>
        </div>
        <Link
          href={`/policies/${p.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1 rounded-md border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
        >
          <ExternalLink className="h-3 w-3" />
          Open public page
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Title</span>
          <input value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </label>
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Summary</span>
          <input value={p.summary ?? ""} onChange={(e) => setP({ ...p, summary: e.target.value })} className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Version</span>
            <input value={p.version} onChange={(e) => setP({ ...p, version: e.target.value })} className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
          </label>
          <label className="flex items-end gap-2 text-sm">
            <input type="checkbox" checked={p.is_published} onChange={(e) => setP({ ...p, is_published: e.target.checked })} />
            <span>Published</span>
          </label>
        </div>
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Content (Markdown)</span>
          <textarea value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} className="mt-1 h-80 w-full rounded-md border border-stone-300 px-3 py-2 font-mono text-sm" />
        </label>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {saved && <p className="text-xs text-emerald-700">Saved at {saved}</p>}
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

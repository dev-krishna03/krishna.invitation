"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Save, Trash2, Loader2, Settings2 } from "lucide-react";

const KINDS = [
  "TEXT","HEADING","NAMES","MESSAGE","BUTTON","DIVIDER","MOTIF","IMAGE",
  "QRCODE","BADGE","COUNTDOWN","MAP","MUSIC","VIDEO","GALLERY","RSVP","SOCIAL","CONTAINER",
] as const;

type ElVM = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  category: string;
  icon: string | null;
  description: string | null;
  default_props: Record<string, unknown>;
  is_pro_only: boolean;
  is_active: boolean;
  sort_order: number;
};

type DraftNew = {
  name: string;
  slug: string;
  kind: string;
  category: string;
  icon: string;
  description: string;
  is_pro_only: boolean;
};

const EMPTY_DRAFT: DraftNew = {
  name: "",
  slug: "",
  kind: "TEXT",
  category: "basic",
  icon: "",
  description: "",
  is_pro_only: false,
};

export function ElementsAdmin({ initial }: { initial: ElVM[] }) {
  const [items, setItems] = useState<ElVM[]>(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<DraftNew>(EMPTY_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byCategory = useMemo(() => {
    const m = new Map<string, ElVM[]>();
    for (const e of items.sort((a, b) => a.sort_order - b.sort_order)) {
      const arr = m.get(e.category) ?? [];
      arr.push(e);
      m.set(e.category, arr);
    }
    return m;
  }, [items]);

  async function patch(id: string, body: Partial<ElVM>) {
    const res = await fetch(`/api/admin/elements/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { element: ElVM };
    setItems((xs) => xs.map((x) => (x.id === d.element.id ? d.element : x)));
    return d.element;
  }

  async function remove(el: ElVM) {
    if (!confirm(`Delete "${el.name}"? Users won't be able to add new copies — existing ones stay in their invitations.`)) return;
    const res = await fetch(`/api/admin/elements/${el.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((xs) => xs.filter((x) => x.id !== el.id));
  }

  async function add() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/elements", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        slug: draft.slug || undefined,
        kind: draft.kind,
        category: draft.category || "basic",
        icon: draft.icon || undefined,
        description: draft.description || undefined,
        default_props: {},
        is_pro_only: draft.is_pro_only,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    const { element } = (await res.json()) as { element: ElVM };
    setItems((xs) => [...xs, element]);
    setDraft(EMPTY_DRAFT);
    setShowAdd(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          {items.length} elements across {byCategory.size} categories
        </p>
        <motion.button
          onClick={() => setShowAdd(true)}
          whileHover={{ scale: 1.02 }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800"
        >
          <Plus className="h-3.5 w-3.5" />
          Add element
        </motion.button>
      </div>

      <div className="mt-6 space-y-6">
        {Array.from(byCategory.entries()).map(([cat, list]) => (
          <section key={cat}>
            <h2 className="text-[11px] font-bold uppercase tracking-wide text-stone-500">{cat}</h2>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((el) => (
                <ElementCard
                  key={el.id}
                  el={el}
                  isEditing={editingId === el.id}
                  onToggleEdit={() => setEditingId((x) => (x === el.id ? null : el.id))}
                  onPatch={(body) => patch(el.id, body)}
                  onRemove={() => remove(el)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-stone-900/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: 12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            >
              <h3 className="font-serif text-lg font-bold text-stone-900">New element</h3>
              <div className="mt-4 space-y-3">
                <Field label="Name">
                  <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Slug (optional)">
                    <input value={draft.slug} placeholder={draft.name ? draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm font-mono" />
                  </Field>
                  <Field label="Category">
                    <input value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Kind">
                    <select value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm">
                      {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                    </select>
                  </Field>
                  <Field label="Icon name (lucide)">
                    <input value={draft.icon} placeholder="Sparkles" onChange={(e) => setDraft({ ...draft, icon: e.target.value })} className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
                  </Field>
                </div>
                <Field label="Description">
                  <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className="h-20 w-full rounded-md border border-stone-300 px-3 py-2 text-sm" />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={draft.is_pro_only} onChange={(e) => setDraft({ ...draft, is_pro_only: e.target.checked })} />
                  Pro / Studio only
                </label>
                {error && <p className="text-xs text-rose-600">{error}</p>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="rounded-md border border-stone-200 px-3 py-1.5 text-xs font-semibold">Cancel</button>
                <button onClick={add} disabled={busy || !draft.name} className="inline-flex items-center gap-1 rounded-md bg-stone-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ElementCard({
  el, isEditing, onToggleEdit, onPatch, onRemove,
}: {
  el: ElVM;
  isEditing: boolean;
  onToggleEdit: () => void;
  onPatch: (body: Partial<ElVM>) => Promise<ElVM | null>;
  onRemove: () => void;
}) {
  const [name, setName] = useState(el.name);
  const [description, setDescription] = useState(el.description ?? "");
  const [category, setCategory] = useState(el.category);
  const [defaults, setDefaults] = useState(JSON.stringify(el.default_props ?? {}, null, 2));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const parsedDefaults = JSON.parse(defaults || "{}");
      await onPatch({ name, description, category, default_props: parsedDefaults });
      onToggleEdit();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`rounded-xl border bg-white p-3 ${el.is_active ? "border-stone-200" : "border-stone-200 opacity-60"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-700">
              {el.kind}
            </span>
            {el.is_pro_only && (
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">PRO</span>
            )}
          </div>
          <p className="mt-1 font-semibold text-stone-900 text-sm truncate">{el.name}</p>
          <p className="text-[11px] text-stone-500 font-mono truncate">{el.slug}</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPatch({ is_active: !el.is_active })}
            title={el.is_active ? "Deactivate" : "Activate"}
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
              el.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-100 text-stone-500"
            }`}
          >
            {el.is_active ? "On" : "Off"}
          </button>
          <button onClick={onToggleEdit} title="Edit" className="rounded border border-stone-200 p-1 hover:bg-stone-50">
            <Settings2 className="h-3 w-3 text-stone-600" />
          </button>
          <button onClick={onRemove} title="Delete" className="rounded border border-stone-200 p-1 hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-3 w-3 text-stone-600" />
          </button>
        </div>
      </div>
      {el.description && !isEditing && (
        <p className="mt-2 text-[11px] text-stone-600 line-clamp-2">{el.description}</p>
      )}

      {isEditing && (
        <div className="mt-3 space-y-2 border-t border-stone-100 pt-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-stone-300 px-2 py-1 text-sm" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-16 w-full rounded-md border border-stone-300 px-2 py-1 text-xs" />
          <textarea value={defaults} onChange={(e) => setDefaults(e.target.value)} className="h-24 w-full rounded-md border border-stone-300 px-2 py-1 font-mono text-[11px]" />
          {err && <p className="text-[11px] text-rose-600">{err}</p>}
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-stone-900 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-50">
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Save
          </button>
        </div>
      )}
    </li>
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

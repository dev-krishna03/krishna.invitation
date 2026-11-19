"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EventIcon, ICON_OPTIONS } from "@/components/EventIcon";

type EventType = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  parent_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

type Draft = {
  name: string;
  slug: string;
  icon: string;
  parent_id: string | null;
  is_featured: boolean;
};

export function EventTypesManager({ initial }: { initial: EventType[] }) {
  const [items, setItems] = useState<EventType[]>(initial);
  const [editing, setEditing] = useState<EventType | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addParent, setAddParent] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ name: "", slug: "", icon: "sparkles", parent_id: null, is_featured: false });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const topLevel = useMemo(
    () => items.filter((x) => x.parent_id === null).sort((a, b) => a.sort_order - b.sort_order),
    [items],
  );
  const byParent = useMemo(() => {
    const m = new Map<string, EventType[]>();
    for (const it of items) {
      if (it.parent_id) {
        const arr = m.get(it.parent_id) ?? [];
        arr.push(it);
        m.set(it.parent_id, arr);
      }
    }
    for (const arr of m.values()) arr.sort((a, b) => a.sort_order - b.sort_order);
    return m;
  }, [items]);

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/event-types/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { eventType: EventType };
    setItems((xs) => xs.map((x) => (x.id === d.eventType.id ? d.eventType : x)));
    return d.eventType;
  }

  async function reorder(siblings: EventType[]) {
    await fetch("/api/admin/event-types/reorder", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ order: siblings.map((x) => x.id) }),
    });
  }

  async function move(id: string, dir: -1 | 1) {
    const me = items.find((x) => x.id === id);
    if (!me) return;
    const siblings = (me.parent_id ? byParent.get(me.parent_id) : topLevel) ?? [];
    const idx = siblings.findIndex((x) => x.id === id);
    const j = idx + dir;
    if (idx < 0 || j < 0 || j >= siblings.length) return;
    const next = siblings.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    // reflect optimistically in sort_order
    setItems((xs) => xs.map((x) => {
      const k = next.findIndex((n) => n.id === x.id);
      return k >= 0 ? { ...x, sort_order: k } : x;
    }));
    await reorder(next);
  }

  async function remove(et: EventType) {
    if (!confirm(`Delete "${et.name}"?`)) return;
    const res = await fetch(`/api/admin/event-types/${et.id}`, { method: "DELETE" });
    const data = (await res.json()) as { ok: boolean; deactivated?: boolean; inUse?: number };
    if (data.deactivated) {
      setItems((xs) => xs.map((x) => (x.id === et.id ? { ...x, is_active: false } : x)));
      alert(`In use by ${data.inUse} invitations — deactivated instead of deleted.`);
    } else {
      setItems((xs) => xs.filter((x) => x.id !== et.id));
    }
  }

  function openAdd(parentId: string | null = null) {
    setAddParent(parentId);
    setDraft({ name: "", slug: "", icon: "sparkles", parent_id: parentId, is_featured: false });
    setError(null);
    setShowAdd(true);
  }

  function openEdit(et: EventType) {
    setDraft({
      name: et.name,
      slug: et.slug,
      icon: et.icon ?? "sparkles",
      parent_id: et.parent_id,
      is_featured: et.is_featured,
    });
    setError(null);
    setEditing(et);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/event-types/${editing.id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: draft.name,
            icon: draft.icon,
            parent_id: draft.parent_id,
            is_featured: draft.is_featured,
          }),
        });
        if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Failed");
        const { eventType } = (await res.json()) as { eventType: EventType };
        setItems((xs) => xs.map((x) => (x.id === eventType.id ? eventType : x)));
        setEditing(null);
      } else {
        const res = await fetch(`/api/admin/event-types`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: draft.name,
            slug: draft.slug || undefined,
            icon: draft.icon,
            parent_id: draft.parent_id,
            is_featured: draft.is_featured,
          }),
        });
        if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Failed");
        const { eventType } = (await res.json()) as { eventType: EventType };
        setItems((xs) => [...xs, eventType]);
        setShowAdd(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const activeDraft = showAdd || editing !== null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Occasions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Top-level occasions on the landing page and in the create wizard. Each may have sub-occasions.
          </p>
        </div>
        <motion.button
          onClick={() => openAdd(null)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          + Add occasion
        </motion.button>
      </div>

      <ul className="mt-6 space-y-3">
        <AnimatePresence initial={false}>
          {topLevel.map((et, i) => {
            const children = byParent.get(et.id) ?? [];
            return (
              <motion.li
                key={et.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className={`rounded-xl border bg-white p-3 ${et.is_active ? "" : "opacity-60"}`}
              >
                <Row
                  et={et}
                  isFirst={i === 0}
                  isLast={i === topLevel.length - 1}
                  onMove={move}
                  onEdit={openEdit}
                  onRemove={remove}
                  onToggleActive={() => patch(et.id, { is_active: !et.is_active })}
                  onToggleFeatured={() => patch(et.id, { is_featured: !et.is_featured })}
                />
                <div className="mt-2 ml-14 border-l-2 border-dashed border-rose-100 pl-4">
                  <ul className="space-y-2">
                    {children.map((c, j) => (
                      <motion.li
                        key={c.id}
                        layout
                        className={`rounded-lg border bg-gray-50 p-2 ${c.is_active ? "" : "opacity-60"}`}
                      >
                        <Row
                          et={c}
                          isFirst={j === 0}
                          isLast={j === children.length - 1}
                          small
                          onMove={move}
                          onEdit={openEdit}
                          onRemove={remove}
                          onToggleActive={() => patch(c.id, { is_active: !c.is_active })}
                          onToggleFeatured={() => patch(c.id, { is_featured: !c.is_featured })}
                        />
                      </motion.li>
                    ))}
                    <li>
                      <button
                        onClick={() => openAdd(et.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-dashed px-2 py-1 text-xs text-gray-600 hover:bg-white"
                      >
                        + Add sub-occasion
                      </button>
                    </li>
                  </ul>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {activeDraft && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setShowAdd(false); setEditing(null); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold">
                {editing ? `Edit "${editing.name}"` : addParent ? "New sub-occasion" : "New occasion"}
              </h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm">
                  Name
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                  />
                </label>
                {!editing && (
                  <label className="block text-sm">
                    Slug <span className="text-xs text-gray-400">(optional — auto from name)</span>
                    <input
                      value={draft.slug}
                      placeholder={draft.name ? draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : ""}
                      onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                      className="mt-1 w-full rounded-md border px-3 py-2 font-mono"
                    />
                  </label>
                )}
                <div>
                  <p className="text-sm font-medium">Parent occasion</p>
                  <select
                    value={draft.parent_id ?? ""}
                    onChange={(e) => setDraft({ ...draft, parent_id: e.target.value || null })}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">— Top level —</option>
                    {topLevel.filter((p) => p.id !== editing?.id).map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-sm font-medium">Icon</p>
                  <div className="mt-2 grid grid-cols-8 gap-2">
                    {ICON_OPTIONS.map((o) => (
                      <button
                        key={o.name}
                        type="button"
                        onClick={() => setDraft({ ...draft, icon: o.name })}
                        title={o.hint}
                        className={`grid aspect-square place-items-center rounded-md border transition-colors ${
                          draft.icon === o.name ? "border-black bg-rose-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <EventIcon name={o.name} className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.is_featured}
                    onChange={(e) => setDraft({ ...draft, is_featured: e.target.checked })}
                  />
                  Featured on landing page
                </label>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => { setShowAdd(false); setEditing(null); }} className="rounded-md border px-4 py-2 text-sm">
                  Cancel
                </button>
                <motion.button
                  onClick={save}
                  disabled={!draft.name || saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  et,
  isFirst,
  isLast,
  small,
  onMove,
  onEdit,
  onRemove,
  onToggleActive,
  onToggleFeatured,
}: {
  et: EventType;
  isFirst: boolean;
  isLast: boolean;
  small?: boolean;
  onMove: (id: string, dir: -1 | 1) => void;
  onEdit: (e: EventType) => void;
  onRemove: (e: EventType) => void;
  onToggleActive: () => void;
  onToggleFeatured: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col">
        <button disabled={isFirst} onClick={() => onMove(et.id, -1)} className="text-xs text-gray-400 disabled:opacity-30">▲</button>
        <button disabled={isLast} onClick={() => onMove(et.id, 1)} className="text-xs text-gray-400 disabled:opacity-30">▼</button>
      </div>
      <span className={`grid place-items-center rounded-lg bg-rose-50 text-rose-700 ${small ? "h-8 w-8" : "h-10 w-10"}`}>
        <EventIcon name={et.icon} className={small ? "h-4 w-4" : "h-5 w-5"} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={small ? "text-sm font-medium" : "font-medium"}>{et.name}</span>
          <span className="font-mono text-xs text-gray-400">{et.slug}</span>
          {et.is_featured && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] uppercase text-amber-800">Featured</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs">
        <Toggle label="Active" on={et.is_active} onClick={onToggleActive} />
        <Toggle label="Featured" on={et.is_featured} onClick={onToggleFeatured} />
        <button onClick={() => onEdit(et)} className="rounded border px-2 py-1">Edit</button>
        <button onClick={() => onRemove(et)} className="rounded border px-2 py-1 text-red-600">Delete</button>
      </div>
    </div>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${
        on ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-gray-400"}`} />
      {label}
    </button>
  );
}

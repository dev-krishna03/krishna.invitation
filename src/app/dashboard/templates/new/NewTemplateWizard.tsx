"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FilePlus2, ShoppingBag, Save as SaveIcon, ArrowRight, Sparkles, Loader2 } from "lucide-react";

type Source = "blank" | "fromInvitation" | "importCommunity";

type InvitationLite = { id: string; title: string; event_type: string; created_at: string };
type CommunityLite = { id: string; name: string; price: number | null; currency: string; category: string; creator: string };

const CATEGORIES = ["LUXURY", "MINIMAL", "TRADITIONAL", "MODERN", "FLORAL", "RUSTIC"] as const;

export function NewTemplateWizard({
  initialSource,
  invitations,
  community,
}: {
  initialSource: Source;
  invitations: InvitationLite[];
  community: CommunityLite[];
}) {
  const router = useRouter();
  const [source, setSource] = useState<Source>(initialSource);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("MINIMAL");
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [communityTemplateId, setCommunityTemplateId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabled = useMemo(() => {
    if (!name) return true;
    if (source === "fromInvitation" && !invitationId) return true;
    if (source === "importCommunity" && !communityTemplateId) return true;
    return false;
  }, [name, source, invitationId, communityTemplateId]);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/workspace/templates", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source,
        name,
        description: description || undefined,
        category,
        invitationId: source === "fromInvitation" ? invitationId : undefined,
        communityTemplateId: source === "importCommunity" ? communityTemplateId : undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    const d = (await res.json()) as { template: { id: string } };
    router.push(`/dashboard/templates/${d.template.id}/edit`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Source picker */}
      <div className="space-y-2">
        <SourceOption
          active={source === "blank"}
          icon={FilePlus2}
          title="Start blank"
          caption="Design from scratch."
          tone="rose"
          onClick={() => setSource("blank")}
        />
        <SourceOption
          active={source === "importCommunity"}
          icon={ShoppingBag}
          title="Import from community"
          caption="Fork a marketplace template."
          tone="amber"
          onClick={() => setSource("importCommunity")}
        />
        <SourceOption
          active={source === "fromInvitation"}
          icon={SaveIcon}
          title="Save invitation as template"
          caption="Promote one of your invitations."
          tone="sky"
          onClick={() => setSource("fromInvitation")}
        />
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-stone-900">
          {source === "blank" ? "Blank template" : source === "importCommunity" ? "Import" : "From invitation"}
        </h2>
        <p className="mt-1 text-xs text-stone-500">
          Give it a name — the rest is configurable from the template editor.
        </p>

        <div className="mt-5 space-y-3">
          <Field label="Template name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunset Royal"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short pitch for buyers"
              className="h-20 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </Field>

          {source === "blank" && (
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          )}

          {source === "fromInvitation" && (
            <Field label="Pick an invitation">
              {invitations.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-300 p-3 text-xs text-stone-500">
                  No invitations yet. Create one first.
                </p>
              ) : (
                <select
                  value={invitationId ?? ""}
                  onChange={(e) => setInvitationId(e.target.value || null)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  {invitations.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.title} — {i.event_type}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}

          {source === "importCommunity" && (
            <Field label="Pick a community template">
              {community.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone-300 p-3 text-xs text-stone-500">
                  Nothing in the marketplace yet.
                </p>
              ) : (
                <div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border border-stone-200 p-2">
                  {community.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCommunityTemplateId(c.id)}
                      className={`flex items-center justify-between rounded-lg border p-2 text-left ${
                        communityTemplateId === c.id ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white hover:bg-stone-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{c.name}</p>
                        <p className="text-[11px] text-stone-500">
                          {c.category.toLowerCase()} · by {c.creator}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-stone-900">
                        {c.price ? `${c.currency === "INR" ? "₹" : c.currency}${c.price.toLocaleString()}` : "Free"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[11px] text-stone-500">
                Importing copies the template into your workspace. The original creator keeps ownership of their listing.
              </p>
            </Field>
          )}

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <motion.button
            onClick={submit}
            disabled={disabled || busy}
            whileHover={!disabled ? { scale: 1.01 } : undefined}
            className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {busy ? "Creating…" : "Create template"}
            {!busy && <ArrowRight className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function SourceOption({
  active, icon: Icon, title, caption, tone, onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  title: string;
  caption: string;
  tone: "rose" | "amber" | "sky";
  onClick: () => void;
}) {
  const toneMap = {
    rose: "border-rose-200",
    amber: "border-amber-200",
    sky: "border-sky-200",
  }[tone];
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition-all ${toneMap} ${
        active ? "bg-stone-900 text-white" : "bg-white hover:bg-stone-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-white/15" : "bg-stone-100"}`}>
          <Icon className={`h-4 w-4 ${active ? "text-white" : "text-stone-700"}`} />
        </span>
        <div>
          <p className={`text-sm font-bold ${active ? "text-white" : "text-stone-900"}`}>{title}</p>
          <p className={`text-[11px] ${active ? "text-white/80" : "text-stone-500"}`}>{caption}</p>
        </div>
      </div>
    </button>
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

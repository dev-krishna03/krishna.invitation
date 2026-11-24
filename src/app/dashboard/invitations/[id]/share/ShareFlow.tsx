"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link2, CheckCircle2, Users, CreditCard, Clipboard, ExternalLink, ArrowLeft, Sparkles, UserCheck, Rocket } from "lucide-react";
import { GuestCsvImporter } from "@/components/invite/GuestCsvImporter";

type Invitation = {
  id: string;
  title: string;
  slug: string;
  preview_token: string | null;
  preview_approved: boolean;
  access_limit: number | null;
  access_used: number;
  is_published: boolean;
  is_in_community: boolean;
  community_price: number | null;
};

type Branch = "pick" | "confirm" | "direct";
type ConfirmStep = "preview" | "approval" | "users" | "payment" | "access";

const TIERS = [
  { count: 100, price: 499 },
  { count: 500, price: 1499 },
  { count: 2000, price: 3999 },
  { count: null as number | null, price: 7999, label: "Unlimited" },
];

export function ShareFlow({ invitation }: { invitation: Invitation }) {
  const [branch, setBranch] = useState<Branch>("pick");
  const [step, setStep] = useState<ConfirmStep>("preview");
  const [tier, setTier] = useState<(typeof TIERS)[number] | null>(null);
  const [previewToken, setPreviewToken] = useState<string | null>(invitation.preview_token);
  const [approved, setApproved] = useState(invitation.preview_approved);
  const [loading, setLoading] = useState(false);

  async function makePreview() {
    setLoading(true);
    const res = await fetch(`/api/invitations/${invitation.id}/preview`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      const d = (await res.json()) as { preview_token: string };
      setPreviewToken(d.preview_token);
    }
  }

  async function approvePreview() {
    setLoading(true);
    await fetch(`/api/invitations/${invitation.id}/preview/approve`, { method: "POST" });
    setLoading(false);
    setApproved(true);
    setStep("users");
  }

  async function payAndActivate() {
    if (!tier) return;
    setLoading(true);
    await fetch(`/api/invitations/${invitation.id}/activate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ access_limit: tier.count, amount: tier.price }),
    });
    setLoading(false);
    setStep("access");
  }

  const previewUrl = previewToken
    ? `${typeof window !== "undefined" ? location.origin : ""}/invite/${invitation.slug}?preview=${previewToken}`
    : "";
  const publicUrl = `${typeof window !== "undefined" ? location.origin : ""}/invite/${invitation.slug}`;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <a href={`/dashboard/invitations/${invitation.id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to invitation
      </a>

      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-700">
          <Share2 className="h-3 w-3" />
          Share Flow
        </div>
        <h1 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {invitation.title}
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Pick how you want to hand this invitation off.
        </p>
      </div>

      {/* Branch picker */}
      {branch === "pick" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <BranchCard
            tone="emerald"
            icon={UserCheck}
            title="Share Preview to Customer"
            caption="Customer reviews first, then you pay by access count. Great for designers / agencies."
            chip="Confirmation + Payment"
            cta="Start confirmation flow"
            onClick={() => { setBranch("confirm"); setStep("preview"); }}
          />
          <BranchCard
            tone="sky"
            icon={Rocket}
            title="Direct Share"
            caption="Generate a public link and send it right away. Great for your own event."
            chip="Instant"
            cta="Generate link"
            onClick={() => setBranch("direct")}
          />
        </div>
      )}

      {/* Confirmation branch */}
      {branch === "confirm" && (
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm">
          <StepRail
            steps={[
              { key: "preview", label: "Preview" },
              { key: "approval", label: "Approval" },
              { key: "users", label: "User Access" },
              { key: "payment", label: "Payment" },
              { key: "access", label: "Share Access" },
            ]}
            current={step}
          />

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {step === "preview" && (
                <StepPanel key="preview">
                  <h2 className="font-serif text-xl font-bold text-stone-900">Share a preview</h2>
                  <p className="mt-1 text-xs text-stone-600">
                    We&apos;ll mint a private preview link your customer can review without a login.
                  </p>
                  {previewToken ? (
                    <CopyRow label="Preview link" value={previewUrl} />
                  ) : (
                    <button
                      onClick={makePreview}
                      disabled={loading}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {loading ? "Creating…" : "Generate preview link"}
                    </button>
                  )}
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setBranch("pick")} className="text-xs text-stone-500">← Change branch</button>
                    <button
                      onClick={() => setStep("approval")}
                      disabled={!previewToken}
                      className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </StepPanel>
              )}

              {step === "approval" && (
                <StepPanel key="approval">
                  <h2 className="font-serif text-xl font-bold text-stone-900">Waiting for approval</h2>
                  <p className="mt-1 text-xs text-stone-600">
                    Your customer confirms the preview. Mark it approved when they say yes — or let them approve themselves from the preview link.
                  </p>
                  {approved ? (
                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Approved
                    </div>
                  ) : (
                    <button
                      onClick={approvePreview}
                      disabled={loading}
                      className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {loading ? "Saving…" : "Mark as approved"}
                    </button>
                  )}
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep("preview")} className="text-xs text-stone-500">← Back</button>
                    <button
                      onClick={() => setStep("users")}
                      disabled={!approved}
                      className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </StepPanel>
              )}

              {step === "users" && (
                <StepPanel key="users">
                  <h2 className="font-serif text-xl font-bold text-stone-900">How many users will open it?</h2>
                  <p className="mt-1 text-xs text-stone-600">
                    Price scales with reach. You can top up later.
                  </p>
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {TIERS.map((t) => (
                      <button
                        key={t.label ?? String(t.count)}
                        onClick={() => setTier(t)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${
                          tier === t ? "border-emerald-500 bg-emerald-50" : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-stone-500">
                            <Users className="h-3 w-3" />
                            {t.count === null ? t.label : `Up to ${t.count}`}
                          </span>
                          <span className="font-serif text-lg font-bold text-stone-900">
                            ₹{t.price.toLocaleString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep("approval")} className="text-xs text-stone-500">← Back</button>
                    <button
                      onClick={() => setStep("payment")}
                      disabled={!tier}
                      className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </StepPanel>
              )}

              {step === "payment" && (
                <StepPanel key="payment">
                  <h2 className="font-serif text-xl font-bold text-stone-900">Payment</h2>
                  <p className="mt-1 text-xs text-stone-600">
                    ₹{tier?.price.toLocaleString()} for{" "}
                    {tier?.count === null ? "unlimited" : `${tier?.count ?? 0} viewers`}.
                  </p>
                  <button
                    onClick={payAndActivate}
                    disabled={loading}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 disabled:opacity-60"
                  >
                    <CreditCard className="h-4 w-4" />
                    {loading ? "Processing…" : `Pay ₹${tier?.price.toLocaleString()}`}
                  </button>
                  <div className="mt-6 flex justify-between">
                    <button onClick={() => setStep("users")} className="text-xs text-stone-500">← Back</button>
                  </div>
                </StepPanel>
              )}

              {step === "access" && (
                <StepPanel key="access">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <h2 className="font-serif text-xl font-bold text-stone-900">Access activated</h2>
                  </div>
                  <p className="mt-1 text-xs text-stone-600">
                    Here&apos;s the customer-ready link. Share it anywhere.
                  </p>
                  <CopyRow label="Public invitation link" value={publicUrl} />

          <div className="mt-5 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-stone-700">
              <span className="font-bold block">Need personalized links per guest?</span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bulk import 100+ guests from a CSV to generate personalized &quot;Dear Family&quot; WhatsApp invite links.
              </p>
            </div>
            <GuestCsvImporter invitationId={invitation.id} />
          </div>
                  <p className="mt-3 text-[11px] text-stone-500">
                    Cap: {tier?.count === null ? "Unlimited viewers" : `${tier?.count ?? 0} viewers`}. Current views counted against the cap.
                  </p>
                </StepPanel>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Direct branch */}
      {branch === "direct" && (
        <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-stone-900">Direct share link</h2>
          <p className="mt-1 text-xs text-stone-600">
            Send this straight to your guests. No confirmation step, no per-user cap unless you set one.
          </p>
          <CopyRow label="Public invitation link" value={publicUrl} />

          <div className="mt-5 rounded-2xl border border-stone-100 bg-stone-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-stone-700">
              <span className="font-bold block">Need personalized links per guest?</span>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Bulk import 100+ guests from a CSV to generate personalized &quot;Dear Family&quot; WhatsApp invite links.
              </p>
            </div>
            <GuestCsvImporter invitationId={invitation.id} />
          </div>
          <div className="mt-6 flex justify-between">
            <button onClick={() => setBranch("pick")} className="text-xs text-stone-500">← Change branch</button>
            <a
              href={`/invite/${invitation.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              <ExternalLink className="h-3 w-3" />
              Open preview
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchCard({
  tone, icon: Icon, title, caption, chip, cta, onClick,
}: {
  tone: "emerald" | "sky";
  icon: React.ElementType;
  title: string;
  caption: string;
  chip: string;
  cta: string;
  onClick: () => void;
}) {
  const toneMap = {
    emerald: { bg: "from-emerald-50 to-teal-50", border: "border-emerald-200", icon: "text-emerald-700", chip: "bg-emerald-100 text-emerald-800" },
    sky: { bg: "from-sky-50 to-indigo-50", border: "border-sky-200", icon: "text-sky-700", chip: "bg-sky-100 text-sky-800" },
  }[tone];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      className={`text-left rounded-2xl border bg-gradient-to-br p-5 shadow-sm hover:shadow-xl hover:shadow-rose-900/5 ${toneMap.bg} ${toneMap.border}`}
    >
      <div className="flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl bg-white/80 ${toneMap.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${toneMap.chip}`}>
          {chip}
        </span>
      </div>
      <h3 className="mt-4 font-serif text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1 text-xs text-stone-600">{caption}</p>
      <p className="mt-4 text-xs font-bold text-stone-900 inline-flex items-center gap-1">
        {cta}
        <span>→</span>
      </p>
    </motion.button>
  );
}

function StepRail({ steps, current }: { steps: { key: string; label: string }[]; current: string }) {
  const currentIdx = steps.findIndex((s) => s.key === current);
  return (
    <ol className="flex items-center gap-2 overflow-x-auto">
      {steps.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex items-center gap-2 shrink-0">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                done
                  ? "bg-emerald-600 text-white"
                  : active
                    ? "bg-stone-900 text-white"
                    : "bg-stone-100 text-stone-500"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <span className={`text-xs ${active ? "font-bold text-stone-900" : "text-stone-500"}`}>{s.label}</span>
            {i < steps.length - 1 && <span className="mx-1 text-stone-300">—</span>}
          </li>
        );
      })}
    </ol>
  );
}

function StepPanel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-stone-500">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <input
          readOnly
          value={value}
          className="flex-1 bg-transparent text-xs font-mono text-stone-800 outline-none truncate"
        />
        <button
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-stone-800"
        >
          {copied ? <CheckCircle2 className="h-3 w-3" /> : <Clipboard className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

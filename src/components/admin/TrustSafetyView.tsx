"use client";

import { useEffect, useState } from "react";
import {
  ShieldAlert,
  Scale,
  AlertOctagon,
  CheckCircle2,
  Trash2,
  Lock,
  ExternalLink,
  RefreshCw,
  Eye,
  UserX,
} from "lucide-react";

type CopyrightReport = {
  id: string;
  template_id: string | null;
  reporter_name: string;
  reporter_email: string;
  proof_url: string;
  description: string;
  status: string;
  action_taken: string | null;
  created_at: string;
  template?: { name: string; slug: string } | null;
};

type CreatorStrike = {
  id: string;
  reason: string;
  strike_number: number;
  created_at: string;
  creator: { name: string | null; email: string };
};

type FlaggedWish = {
  id: string;
  author_name: string;
  message: string;
  flag_reason: string | null;
  created_at: string;
  invitation: { title: string; slug: string };
};

export function TrustSafetyView() {
  const [reports, setReports] = useState<CopyrightReport[]>([]);
  const [strikes, setStrikes] = useState<CreatorStrike[]>([]);
  const [flaggedWishes, setFlaggedWishes] = useState<FlaggedWish[]>([]);
  const [dpdpStats, setDpdpStats] = useState<{ totalConsents: number; expiredEventsCount: number }>({
    totalConsents: 0,
    expiredEventsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/trust-safety");
      const d = await res.json();
      if (d.copyrightReports) setReports(d.copyrightReports);
      if (d.creatorStrikes) setStrikes(d.creatorStrikes);
      if (d.flaggedWishes) setFlaggedWishes(d.flaggedWishes);
      if (d.dpdpStats) setDpdpStats(d.dpdpStats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function resolveCopyright(report_id: string, resolution: "UPHELD" | "DISMISSED") {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/trust-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resolve_copyright",
          report_id,
          resolution,
          issue_strike: resolution === "UPHELD",
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(
          resolution === "UPHELD"
            ? "Copyright claim UPHELD: Template taken down and strike issued to creator."
            : "Copyright claim DISMISSED."
        );
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function moderateWish(wish_id: string, approved: boolean) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/trust-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "moderate_wish", wish_id, approved }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(approved ? "Message approved for public display." : "Message removed.");
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function runDpdpPurge() {
    if (!confirm("Are you sure? This will redact personal guest phone numbers for all events expired over 30 days ago in compliance with India's DPDP Act.")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/trust-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge_dpdp_expired" }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(`DPDP Compliance Purge executed. ${d.redactedCount} guest records redacted.`);
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12042F] flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[#6520EE]" />
            Trust, Safety &amp; DPDP Compliance
          </h1>
          <p className="mt-1 text-xs text-[#7A7387]">
            Copyright takedowns, creator strike system, profanity filtering, and DPDP personal data retention.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={actionLoading}
          className="flex items-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-4 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-4 text-xs font-medium text-[#6520EE] flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* DPDP Act India Compliance Card */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-gradient-to-br from-white to-[#F5F1FE]/50 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="rounded-full bg-[#6520EE] text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Legal Compliance
            </span>
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2 mt-1">
              <Lock className="h-4 w-4 text-[#6520EE]" />
              Digital Personal Data Protection (DPDP) Act Compliance
            </h2>
            <p className="text-xs text-[#7A7387] max-w-xl">
              Guest phone numbers and travel itineraries are personal data. By law, data must be retained only as long as necessary. Post-event data is scheduled for automated redaction 30 days after event conclusion.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-[#7A7387] block">Active Guest Consents</span>
              <span className="text-lg font-bold text-[#12042F]">{dpdpStats.totalConsents} records</span>
            </div>
            <button
              onClick={runDpdpPurge}
              disabled={actionLoading}
              className="rounded-full bg-[#12042F] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#6520EE] transition-colors"
            >
              Run Expired Event Purge
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Takedowns & Creator Strikes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Copyright Reports */}
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#12042F] flex items-center gap-2">
              <Scale className="h-4 w-4 text-[#6520EE]" />
              Copyright &amp; DMCA Takedown Notices
            </h2>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
              {reports.filter((r) => r.status === "PENDING").length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="text-xs text-[#7A7387] py-4 text-center">No copyright claims filed.</p>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#12042F]">{r.reporter_name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                        r.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : r.status === "UPHELD"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-stone-600 line-clamp-2">{r.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E5D9FC]">
                    <a
                      href={r.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6520EE] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Proof Documentation</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    {r.status === "PENDING" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => resolveCopyright(r.id, "DISMISSED")}
                          disabled={actionLoading}
                          className="rounded-full border border-stone-200 px-3 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-100"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => resolveCopyright(r.id, "UPHELD")}
                          disabled={actionLoading}
                          className="rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
                        >
                          Takedown &amp; Strike
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Creator Strikes & Abuse Prevention */}
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#12042F] flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-rose-600" />
              Creator Strike System (3-Strike Policy)
            </h2>
            <span className="text-xs text-[#7A7387]">Strike 3 = Account Ban</span>
          </div>

          <div className="space-y-3">
            {strikes.length === 0 ? (
              <p className="text-xs text-[#7A7387] py-4 text-center">No active creator strikes. All clean!</p>
            ) : (
              strikes.map((s) => (
                <div key={s.id} className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#12042F]">{s.creator.name ?? s.creator.email}</span>
                    <span className="rounded-full bg-rose-600 text-white px-2 py-0.5 text-[10px] font-bold">
                      Strike #{s.strike_number} of 3
                    </span>
                  </div>
                  <p className="text-stone-700">{s.reason}</p>
                  <span className="text-[10px] text-stone-400 block pt-1">
                    Issued on {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quarantined Guest Wishes & Moderation */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#12042F]">Content Moderation &amp; Wish Wall Quarantine</h2>
            <p className="text-xs text-[#7A7387]">Review flagged guest blessings and filter hate speech or offensive text.</p>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            {flaggedWishes.length} Pending Review
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {flaggedWishes.length === 0 ? (
            <p className="col-span-2 text-xs text-[#7A7387] py-6 text-center">
              No quarantined messages. All guest wishes are approved.
            </p>
          ) : (
            flaggedWishes.map((w) => (
              <div key={w.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#12042F] block">{w.author_name}</span>
                    <span className="text-[10px] text-[#7A7387]">For: {w.invitation.title}</span>
                  </div>
                  <span className="rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[9px] font-bold">
                    Flagged
                  </span>
                </div>

                <p className="rounded-xl bg-white p-2.5 border border-[#E5D9FC] text-stone-800 italic">
                  &ldquo;{w.message}&rdquo;
                </p>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => moderateWish(w.id, false)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                  <button
                    onClick={() => moderateWish(w.id, true)}
                    disabled={actionLoading}
                    className="flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

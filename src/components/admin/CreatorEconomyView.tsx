"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  Sparkles,
  Users,
  HandCoins,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  Palette,
  Landmark,
  Smartphone,
  Check,
  X,
  AlertCircle,
  TrendingDown,
  Building2,
  ShieldCheck,
} from "lucide-react";

type CustomRequest = {
  id: string;
  title: string;
  event_type: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
  host: { name: string | null; email: string };
  bids: {
    id: string;
    amount: number;
    proposal: string;
    delivery_days: number;
    status: string;
    creator: { name: string | null; email: string };
  }[];
};

type ConciergeOrder = {
  id: string;
  status: string;
  assigned_to: string | null;
  notes: string | null;
  amount: number;
  created_at: string;
  user: { name: string | null; email: string };
  invitation?: { title: string; slug: string } | null;
};

type AffiliatePartner = {
  id: string;
  code: string;
  company_name: string | null;
  category: string;
  commission_pct: number;
  total_earned: number;
  total_paid: number;
  status: string;
  user: { name: string | null; email: string };
  referrals: { id: string }[];
};

type CreatorTier = {
  tier: string;
  minSales: number;
  platformFeePct: number;
  benefits: string;
};

type PayoutRequest = {
  id: string;
  user_id: string;
  amount: number;
  whatsapp_fee_deducted: number;
  net_payout_amount: number;
  currency: string;
  method: string; // "BANK" | "UPI"
  account_number: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  upi_id: string | null;
  status: string; // "PENDING" | "PROCESSING" | "COMPLETED" | "REJECTED"
  utr_reference: string | null;
  created_at: string;
  processed_at: string | null;
  admin_notes: string | null;
  user: { name: string | null; email: string };
};

export function CreatorEconomyView() {
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [conciergeOrders, setConciergeOrders] = useState<ConciergeOrder[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliatePartner[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [tiers, setTiers] = useState<CreatorTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Settlement modal state
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/creator-economy");
      const d = await res.json();
      if (d.customRequests) setCustomRequests(d.customRequests);
      if (d.conciergeOrders) setConciergeOrders(d.conciergeOrders);
      if (d.affiliatePartners) setAffiliates(d.affiliatePartners);
      if (d.payoutRequests) setPayoutRequests(d.payoutRequests);
      if (d.creatorTiers) setTiers(d.creatorTiers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateConciergeStatus(order_id: string, status: string) {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/creator-economy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_concierge_status", order_id, status }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(`Concierge order status updated to ${status}.`);
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function approvePayout() {
    if (!selectedPayout) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/creator-economy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_creator_payout",
          payout_id: selectedPayout.id,
          utr_reference: utrInput.trim() || `UTR-${Date.now().toString(36).toUpperCase()}`,
          admin_notes: notesInput.trim() || `Settled via ${selectedPayout.method}`,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg(
          `Payout of ₹${selectedPayout.net_payout_amount.toLocaleString()} marked as COMPLETED (UTR: ${
            utrInput || "Generated"
          }).`,
        );
        setSelectedPayout(null);
        setUtrInput("");
        setNotesInput("");
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectPayout(payoutId: string) {
    const reason = prompt("Enter reason for rejection (optional):") || "Rejected by administrator";
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/creator-economy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_creator_payout",
          payout_id: payoutId,
          reason,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("Payout request rejected.");
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  const pendingPayouts = payoutRequests.filter((p) => p.status === "PENDING");
  const totalDisbursed = payoutRequests
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.net_payout_amount, 0);
  const totalWaDeducted = payoutRequests.reduce((sum, p) => sum + p.whatsapp_fee_deducted, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12042F] flex items-center gap-2">
            <Crown className="h-6 w-6 text-[#6520EE]" />
            Creator Economy, Revenue &amp; Central Payouts
          </h1>
          <p className="mt-1 text-xs text-[#7A7387]">
            Central payment collection via Razorpay, WhatsApp send fee recovery, Bank &amp; UPI payouts, custom design
            bidding, and affiliate network.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={actionLoading}
          className="flex items-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-4 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {msg && (
        <div className="rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-4 text-xs font-medium text-[#6520EE] flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-600">
            ✕
          </button>
        </div>
      )}

      {/* SECTION 1: Centralized Payout Settlements Pipeline */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#12042F]">
                  Creator Payout Settlements (Bank IMPS/NEFT &amp; UPI)
                </h2>
                <p className="text-xs text-[#7A7387]">
                  All customer payments are collected centrally into our account. Platform fee and WhatsApp delivery
                  costs are deducted before creator payout.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-2xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800">
              {pendingPayouts.length} Pending Approval
            </span>
            <span className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
              ₹{totalDisbursed.toLocaleString()} Total Disbursed
            </span>
          </div>
        </div>

        {/* Financial Flow Architecture Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl bg-[#FAF9FD] border border-[#E5D9FC] p-4 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-[#6520EE] mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-[#12042F] block">1. 100% Platform Collection</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                All host payments go into our central Razorpay gateway. Zero creator chargebacks or gateway setup required.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <TrendingDown className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-[#12042F] block">2. Automated Cost Deductions</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Platform commission (0-20%) + WhatsApp message sends (₹1/msg) deducted from gross earnings automatically.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold text-[#12042F] block">3. Direct Bank / UPI Transfer</span>
              <p className="text-stone-600 text-[11px] mt-0.5">
                Admin approves withdrawal and transfers net amount to creator&apos;s verified Bank A/C or UPI ID with UTR.
              </p>
            </div>
          </div>
        </div>

        {/* Payout Requests List */}
        <div className="space-y-3">
          {payoutRequests.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-500">
              No creator payout requests received yet.
            </div>
          ) : (
            payoutRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-2xl border border-[#E5D9FC] bg-white p-4.5 text-xs shadow-xs hover:border-[#6520EE]/40 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                        req.method === "BANK"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {req.method === "BANK" ? <Building2 className="h-5 w-5" /> : <Smartphone className="h-5 w-5" />}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#12042F]">{req.user.name ?? req.user.email}</span>
                        <span className="text-[11px] text-stone-500 font-normal">({req.user.email})</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            req.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        Requested: {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="flex items-center gap-4 bg-[#FAF9FD] rounded-xl px-4 py-2 border border-[#E5D9FC]">
                    <div>
                      <span className="text-[10px] text-stone-500 block">Gross Request</span>
                      <span className="font-semibold text-stone-800">₹{req.amount.toLocaleString()}</span>
                    </div>
                    <div className="text-rose-600">
                      <span className="text-[10px] block">WhatsApp Cost</span>
                      <span className="font-semibold">-₹{req.whatsapp_fee_deducted.toLocaleString()}</span>
                    </div>
                    <div className="border-l border-stone-200 pl-4">
                      <span className="text-[10px] font-bold text-[#6520EE] block">Net Transfer</span>
                      <span className="font-bold text-sm text-[#6520EE]">₹{req.net_payout_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details & Transfer Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <div className="text-[11px] text-stone-700 font-mono">
                    {req.method === "BANK" ? (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-stone-500" />
                        <strong>Bank:</strong> {req.bank_name || "Bank Account"} | <strong>A/C:</strong> {req.account_number} | <strong>IFSC:</strong> {req.ifsc_code}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-stone-500" />
                        <strong>UPI ID:</strong> {req.upi_id}
                      </span>
                    )}
                    {req.utr_reference && (
                      <span className="block mt-1 text-emerald-700">
                        <strong>UTR Ref:</strong> {req.utr_reference}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => rejectPayout(req.id)}
                          disabled={actionLoading}
                          className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 px-3 py-1.5 font-bold transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayout(req);
                            setUtrInput(`UTR-${Date.now().toString(36).toUpperCase()}`);
                          }}
                          disabled={actionLoading}
                          className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-1.5 font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve &amp; Mark Transferred
                        </button>
                      </>
                    )}
                    {req.status === "COMPLETED" && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Settled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settle Payout Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#E5D9FC] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-sm text-[#12042F] flex items-center gap-2">
                <Landmark className="h-4 w-4 text-emerald-600" />
                Confirm Transfer Settlement
              </h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className="text-stone-400 hover:text-stone-600 rounded-full p-1"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-[#FAF9FD] p-4 border border-[#E5D9FC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Creator:</span>
                <span className="font-bold text-[#12042F]">{selectedPayout.user.name ?? selectedPayout.user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Method:</span>
                <span className="font-bold text-[#12042F]">{selectedPayout.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Destination:</span>
                <span className="font-mono text-[#12042F]">
                  {selectedPayout.method === "BANK"
                    ? `${selectedPayout.account_number} (${selectedPayout.ifsc_code})`
                    : selectedPayout.upi_id}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 font-bold">
                <span className="text-[#6520EE]">Net Amount to Disburse:</span>
                <span className="text-emerald-700 text-sm">₹{selectedPayout.net_payout_amount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Bank / UPI UTR Reference Number
                </span>
                <input
                  value={utrInput}
                  onChange={(e) => setUtrInput(e.target.value)}
                  placeholder="e.g. HDFC2026112499120"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono font-bold text-stone-900"
                />
              </label>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Admin Settlement Notes (optional)
                </span>
                <input
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Paid via HDFC Corporate NetBanking"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setSelectedPayout(null)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={approvePayout}
                disabled={actionLoading}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors"
              >
                Confirm Settlement &amp; Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Tiers & Platform Fee Hierarchy */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
            <Award className="h-5 w-5 text-[#6520EE]" />
            Creator Tiers &amp; Lowered Platform Fees
          </h2>
          <p className="text-xs text-[#7A7387]">
            Top designers earn more as sales grow, keeping the best design talent loyal to our marketplace.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <div
              key={t.tier}
              className={`rounded-2xl border p-4 space-y-2 ${
                t.tier === "Platinum Studio"
                  ? "border-[#6520EE] bg-[#F5F1FE]/50"
                  : "border-[#E5D9FC] bg-[#FAF9FD]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#12042F]">{t.tier}</span>
                <span className="rounded-full bg-[#6520EE] text-white px-2 py-0.5 text-[10px] font-bold">
                  {t.platformFeePct}% Fee
                </span>
              </div>
              <span className="text-[11px] font-semibold text-stone-500 block">
                {t.minSales === 0 ? "Entry Tier (0 sales)" : `${t.minSales}+ Verified Sales`}
              </span>
              <p className="text-[11px] text-stone-600">{t.benefits}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Design Commissions Hub */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
              <Palette className="h-5 w-5 text-[#6520EE]" />
              &ldquo;Request a Design&rdquo; Custom Commissions Hub
            </h2>
            <p className="text-xs text-[#7A7387]">
              Hosts post bespoke briefs and creators bid. Platform retains 10% commission on accepted bids.
            </p>
          </div>
          <span className="rounded-full bg-[#F5F1FE] px-3 py-1 text-xs font-bold text-[#6520EE] border border-[#E5D9FC]">
            {customRequests.length} Custom Requests
          </span>
        </div>

        <div className="space-y-4">
          {customRequests.length === 0 ? (
            <p className="text-xs text-[#7A7387] py-6 text-center">No custom design briefs currently active.</p>
          ) : (
            customRequests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#12042F]">{req.title}</span>
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 border border-amber-200">
                        {req.event_type}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7A7387]">
                      Host: {req.host.name ?? req.host.email} • Budget: ₹{req.budget.toLocaleString()}
                    </span>
                  </div>

                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold self-start">
                    {req.status}
                  </span>
                </div>

                <p className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-[#E5D9FC]">
                  {req.description}
                </p>

                {/* Bids */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Creator Bids ({req.bids.length})
                  </span>
                  {req.bids.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-xl bg-white p-3 border border-[#E5D9FC] text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#12042F]">
                          {b.creator.name ?? b.creator.email} — ₹{b.amount.toLocaleString()} ({b.delivery_days} days)
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">{b.proposal}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                          Platform 10%: ₹{Math.round(b.amount * 0.1).toLocaleString()}
                        </span>
                        <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Done-For-You Concierge & Affiliates Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Concierge Service Orders */}
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#6520EE]" />
              Done-For-You Concierge Service Pipeline
            </h2>
            <span className="text-xs text-stone-500">₹999 / ₹1,499 Setup</span>
          </div>

          <div className="space-y-3">
            {conciergeOrders.length === 0 ? (
              <p className="text-xs text-[#7A7387] py-6 text-center">No active concierge requests.</p>
            ) : (
              conciergeOrders.map((o) => (
                <div key={o.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#12042F]">{o.user.name ?? o.user.email}</span>
                      <span className="text-[11px] text-[#7A7387] block">
                        Assigned To: {o.assigned_to ?? "Unassigned"}
                      </span>
                    </div>
                    <span className="rounded-full bg-[#6520EE] text-white px-2.5 py-0.5 text-[10px] font-bold">
                      {o.status}
                    </span>
                  </div>

                  {o.notes && <p className="text-stone-600 italic text-[11px]">&ldquo;{o.notes}&rdquo;</p>}

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#E5D9FC]">
                    {["ASSIGNED", "IN_PROGRESS", "DELIVERED"].map((st) => (
                      <button
                        key={st}
                        onClick={() => updateConciergeStatus(o.id, st)}
                        disabled={actionLoading}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                          o.status === st
                            ? "bg-[#6520EE] text-white"
                            : "bg-white border border-[#E5D9FC] text-stone-600 hover:bg-[#F5F1FE]"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Affiliate Partner Program */}
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-emerald-600" />
              Affiliate Partner Network (10% - 15%)
            </h2>
            <span className="text-xs text-stone-500">Photographers &amp; Planners</span>
          </div>

          <div className="space-y-3">
            {affiliates.length === 0 ? (
              <p className="text-xs text-[#7A7387] py-6 text-center">No registered affiliate partners.</p>
            ) : (
              affiliates.map((a) => (
                <div key={a.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#12042F]">{a.company_name ?? a.user.name}</span>
                      <span className="text-[10px] font-mono font-bold text-[#6520EE] block">
                        Code: {a.code} ({a.commission_pct}% Cut)
                      </span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      {a.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#E5D9FC]">
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-stone-400 block">Referrals</span>
                      <span className="font-bold text-[#12042F]">{a.referrals.length}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-stone-400 block">Total Earned</span>
                      <span className="font-bold text-emerald-600">₹{a.total_earned.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-semibold text-stone-400 block">Paid Out</span>
                      <span className="font-bold text-[#12042F]">₹{a.total_paid.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

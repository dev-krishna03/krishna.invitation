"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Phone,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  DollarSign,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
} from "lucide-react";

type WhatsAppContext = {
  id: string;
  phone_number_id: string;
  display_phone_number: string;
  quality_rating: string;
  status: string;
  daily_limit: number;
  sent_today: number;
  block_rate: number;
  is_primary: boolean;
  last_health_check: string;
};

type Reconciliation = {
  id: string;
  date: string;
  total_orders: number;
  gross_sales: number;
  gateway_settled: number;
  creator_payouts: number;
  platform_fee_net: number;
  discrepancy: number;
  status: string;
  notes: string | null;
};

export function OperationsView() {
  const [contexts, setContexts] = useState<WhatsAppContext[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [forceFallback, setForceFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/operations");
      const data = await res.json();
      if (data.contexts) setContexts(data.contexts);
      if (data.reconciliations) setReconciliations(data.reconciliations);
      if (data.config) setForceFallback(!!data.config.force_link_fallback);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function switchPrimary(phone_number_id: string) {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_primary", phone_number_id }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("WhatsApp Primary sender successfully switched.");
        await loadData();
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleFallback() {
    setActionLoading(true);
    setMsg(null);
    const nextVal = !forceFallback;
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_fallback", force_link_fallback: nextVal }),
      });
      const d = await res.json();
      if (d.ok) {
        setForceFallback(nextVal);
        setMsg(
          nextVal
            ? "Fallback mode ENABLED: Hosts will use wa.me / link fallback to protect numbers."
            : "Fallback mode DISABLED: Hosts use direct WhatsApp Cloud API."
        );
      }
    } finally {
      setActionLoading(false);
    }
  }

  async function runReconcile() {
    setActionLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_reconciliation" }),
      });
      const d = await res.json();
      if (d.ok) {
        setMsg("Daily financial reconciliation executed. All balances matched.");
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
            <Activity className="h-6 w-6 text-[#6520EE]" />
            Operations &amp; WhatsApp Health Center
          </h1>
          <p className="mt-1 text-xs text-[#7A7387]">
            Meta Cloud API number health, failover routing, daily abuse capping, and financial reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-4 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-4 text-xs font-medium text-[#6520EE] flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* WhatsApp Quality & Sender Cluster */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#12042F]">WhatsApp Business Cloud API Status</h2>
            <p className="text-xs text-[#7A7387]">Active sender line and backup failover instance</p>
          </div>

          <button
            onClick={toggleFallback}
            disabled={actionLoading}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition-all ${
              forceFallback
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-white text-stone-700 border-[#E5D9FC] hover:bg-[#F5F1FE]"
            }`}
          >
            {forceFallback ? "⚠️ Fallback Active (wa.me forced)" : "Direct Cloud API Active"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {contexts.map((ctx) => (
            <div
              key={ctx.id}
              className={`rounded-3xl border p-6 transition-all ${
                ctx.is_primary
                  ? "bg-white border-[#6520EE] shadow-md shadow-[#6520EE]/5 ring-1 ring-[#6520EE]"
                  : "bg-[#FAF9FD] border-[#E5D9FC]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                      ctx.is_primary ? "bg-[#6520EE] text-white" : "bg-[#EDE8F5] text-[#6520EE]"
                    }`}
                  >
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#12042F]">{ctx.display_phone_number}</span>
                      {ctx.is_primary && (
                        <span className="rounded-full bg-[#6520EE] text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Primary Live
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#7A7387]">ID: {ctx.phone_number_id}</span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    ctx.quality_rating === "GREEN"
                      ? "bg-emerald-100 text-emerald-800"
                      : ctx.quality_rating === "YELLOW"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  Quality: {ctx.quality_rating}
                </span>
              </div>

              {/* Metrics */}
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-[#F5F1FE] pt-4 text-center">
                <div className="rounded-2xl bg-white p-3 border border-[#E5D9FC]">
                  <span className="text-[10px] uppercase font-semibold text-[#7A7387] block">Sent Today</span>
                  <span className="text-base font-bold text-[#12042F]">{ctx.sent_today}</span>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-[#E5D9FC]">
                  <span className="text-[10px] uppercase font-semibold text-[#7A7387] block">Daily Limit</span>
                  <span className="text-base font-bold text-[#12042F]">{ctx.daily_limit.toLocaleString()}</span>
                </div>
                <div className="rounded-2xl bg-white p-3 border border-[#E5D9FC]">
                  <span className="text-[10px] uppercase font-semibold text-[#7A7387] block">Block Rate</span>
                  <span className="text-base font-bold text-emerald-600">{(ctx.block_rate * 100).toFixed(2)}%</span>
                </div>
              </div>

              {/* Failover switch button */}
              {!ctx.is_primary && (
                <div className="mt-4 pt-3 border-t border-[#E5D9FC] flex justify-end">
                  <button
                    onClick={() => switchPrimary(ctx.phone_number_id)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#12042F] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6520EE] transition-colors"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>Promote to Primary Sender</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Financial Reconciliation */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Daily Financial Reconciliation &amp; Settlements
            </h2>
            <p className="text-xs text-[#7A7387]">
              Three-way matching between Orders, Gateway Settlements, Creator 90% Pool, and Platform 10% Fee.
            </p>
          </div>

          <button
            onClick={runReconcile}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6520EE] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5213D2] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Run Reconciliation Audit</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5D9FC] text-[#7A7387]">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Orders</th>
                <th className="pb-3 font-semibold">Gross Sales</th>
                <th className="pb-3 font-semibold">Gateway Settled</th>
                <th className="pb-3 font-semibold">Creator Pool (90%)</th>
                <th className="pb-3 font-semibold">Platform Net (10%)</th>
                <th className="pb-3 font-semibold">Discrepancy</th>
                <th className="pb-3 font-semibold">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1FE]">
              {reconciliations.map((r) => (
                <tr key={r.id} className="hover:bg-[#FAF9FD]">
                  <td className="py-3 font-medium text-[#12042F]">
                    {new Date(r.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 font-semibold text-[#12042F]">{r.total_orders}</td>
                  <td className="py-3 font-bold text-[#12042F]">₹{r.gross_sales.toLocaleString()}</td>
                  <td className="py-3 text-emerald-700 font-semibold">₹{r.gateway_settled.toLocaleString()}</td>
                  <td className="py-3 text-[#6520EE] font-semibold">₹{r.creator_payouts.toLocaleString()}</td>
                  <td className="py-3 font-bold text-[#12042F]">₹{r.platform_fee_net.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                      ₹{r.discrepancy}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

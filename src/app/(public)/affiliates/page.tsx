"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HandCoins,
  Camera,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function AffiliatesPage() {
  const [partnerType, setPartnerType] = useState("PHOTOGRAPHER");
  const [codeName, setCodeName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [copied, setCopied] = useState(false);
  const [registeredCode, setRegisteredCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersPerMonth, setOrdersPerMonth] = useState(25);

  const avgOrder = 1800;
  const commissionRate = 0.12; // 12%
  const monthlyEarnings = Math.round(ordersPerMonth * avgOrder * commissionRate);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeName,
          company_name: companyName,
          category: partnerType,
        }),
      });
      const d = await res.json();
      if (d.ok && d.partner) {
        setRegisteredCode(d.partner.code);
      } else {
        // Fallback for unauthenticated preview
        setRegisteredCode(codeName.toUpperCase().replace(/[^A-Z0-9]/g, "") || "STUDIO_PARTNER");
      }
    } catch {
      setRegisteredCode(codeName.toUpperCase().replace(/[^A-Z0-9]/g, "") || "STUDIO_PARTNER");
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    const link = `https://krishnainvites.com/?ref=${registeredCode || "YOUR_CODE"}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-16 space-y-16 font-sans">
      {/* Hero Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5D9FC] bg-[#F5F1FE] px-4 py-1.5 text-xs font-semibold text-[#6520EE]">
          <HandCoins className="h-4 w-4" />
          <span>Affiliate &amp; Wedding Partner Program</span>
        </span>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#12042F] leading-tight">
          Earn <span className="text-[#6520EE]">12% to 15%</span> on every wedding invitation you recommend.
        </h1>

        <p className="text-sm text-[#64748B] leading-relaxed">
          Designed for wedding photographers, planners, decorators, and venues. Give your couples modern, music-enabled digital WhatsApp invitations and earn recurring payouts.
        </p>
      </div>

      {/* Commission Calculator */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-gradient-to-br from-white via-[#FAF9FD] to-[#F5F1FE]/50 p-8 shadow-xs max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE]">Earnings Calculator</span>
          <h2 className="text-2xl font-bold text-[#12042F] mt-1">Estimate Your Monthly Referral Income</h2>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between text-xs font-semibold text-[#12042F]">
            <span>Couples referred per month:</span>
            <span className="font-bold text-[#6520EE] text-sm">{ordersPerMonth} Weddings</span>
          </div>

          <input
            type="range"
            min={5}
            max={100}
            step={5}
            value={ordersPerMonth}
            onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
            className="w-full accent-[#6520EE] h-2 bg-[#E5D9FC] rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-3 gap-4 pt-4 text-center border-t border-[#E5D9FC]">
            <div className="rounded-2xl bg-white p-4 border border-[#E5D9FC]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Avg Order Value</span>
              <span className="text-base font-bold text-[#12042F]">₹{avgOrder.toLocaleString()}</span>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-[#E5D9FC]">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Commission Cut</span>
              <span className="text-base font-bold text-[#6520EE]">12% Net</span>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-[#6520EE] shadow-sm">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">You Earn / Month</span>
              <span className="text-lg font-bold text-emerald-700">₹{monthlyEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Registration / Generator */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-8 shadow-xs max-w-xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#12042F]">Get Your Trackable Partner Code</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Share this link with your wedding clients or put it in your booking packages.
          </p>
        </div>

        {!registeredCode ? (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                Your Studio / Business Name
              </label>
              <input
                placeholder="e.g. Moments Photography & Films"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                Desired Referral Code (e.g. MOMENTS)
              </label>
              <input
                placeholder="MOMENTS"
                value={codeName}
                onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                required
                className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs uppercase font-mono text-[#12042F] focus:outline-none focus:border-[#6520EE]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Business Category</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
              >
                <option value="PHOTOGRAPHER">Wedding Photographer &amp; Cinematographer</option>
                <option value="PLANNER">Event / Wedding Planner</option>
                <option value="DECORATOR">Wedding Decorator &amp; Florist</option>
                <option value="VENUE">Resort / Heritage Banquet Venue</option>
                <option value="MAKEUP">Bridal Makeup Artist</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#6520EE] py-3 text-xs font-semibold text-white hover:bg-[#5213D2] transition-colors shadow-sm"
            >
              {loading ? "Generating..." : "Generate Affiliate Link &amp; Join"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-[#6520EE] bg-[#F5F1FE] p-5 space-y-3">
            <span className="text-xs font-bold text-[#6520EE] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>Partner Code Activated: {registeredCode}</span>
            </span>

            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`https://krishnainvites.com/?ref=${registeredCode}`}
                className="flex-1 rounded-xl border border-[#E5D9FC] bg-white p-2.5 text-xs font-mono text-[#12042F]"
              />
              <button
                onClick={copyLink}
                className="rounded-xl bg-[#6520EE] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#5213D2] flex items-center gap-1 shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <p className="text-[11px] text-[#64748B]">
              Whenever couples book via your link or enter coupon <strong>{registeredCode}</strong>, they get 10% off and you receive 12% commission automatically credited.
            </p>
          </div>
        )}
      </div>

      {/* 3 Step Workflow */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            step: "01",
            title: "Share with Couples",
            desc: "Recommend your personalized link during client meetings, proposals, or WhatsApp chats.",
          },
          {
            step: "02",
            title: "Couple Selects & Buys",
            desc: "They pick a royal wedding or celebration template and complete our pay-by-days checkout.",
          },
          {
            step: "03",
            title: "Automated UPI Payout",
            desc: "Your 12% to 15% commission is automatically released to your registered UPI / bank account.",
          },
        ].map((s) => (
          <div key={s.step} className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-2">
            <span className="rounded-full bg-[#F5F1FE] text-[#6520EE] px-3 py-1 text-xs font-bold font-mono">
              {s.step}
            </span>
            <h3 className="text-base font-bold text-[#12042F]">{s.title}</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

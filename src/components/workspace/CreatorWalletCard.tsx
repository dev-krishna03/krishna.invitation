"use client";

import { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, ShieldCheck, CheckCircle2, Clock, Landmark, Smartphone } from "lucide-react";

export function CreatorWalletCard({
  availableAmount,
  pendingHoldAmount,
  totalEarnedAmount,
}: {
  availableAmount: number;
  pendingHoldAmount: number;
  totalEarnedAmount: number;
}) {
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank">("upi");
  const [upiId, setUpiId] = useState("");
  const [bankAcc, setBankAcc] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(availableAmount > 0 ? availableAmount : 1000);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [savedProfileLoaded, setSavedProfileLoaded] = useState(false);

  useEffect(() => {
    if (isPayoutModalOpen && !savedProfileLoaded) {
      fetch("/api/workspace/payout-profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.profile) {
            if (data.profile.upi_id) setUpiId(data.profile.upi_id);
            if (data.profile.account_number) setBankAcc(data.profile.account_number);
            if (data.profile.ifsc_code) setBankIfsc(data.profile.ifsc_code);
            if (data.profile.payout_preference === "BANK") setPayoutMethod("bank");
            else setPayoutMethod("upi");
            setSavedProfileLoaded(true);
          }
        })
        .catch(() => {});
    }
  }, [isPayoutModalOpen, savedProfileLoaded]);

  function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    setPayoutSuccess(true);
    setTimeout(() => {
      setPayoutSuccess(false);
      setIsPayoutModalOpen(false);
    }, 2500);
  }

  return (
    <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-stone-50 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-rose-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-600 text-white shadow-2xs">
              <Wallet className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-bold text-stone-900">
              Creator Marketplace Wallet
            </span>
            <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              90% Payout Rate
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            You earn 90% of every template sale. Platform retains 10% fee. Funds are held for 7 days to cover refunds, then released for instant withdrawal.
          </p>
        </div>

        <button
          onClick={() => setIsPayoutModalOpen(true)}
          disabled={availableAmount < 500}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Request Payout</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Available for Withdrawal
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
            ₹{availableAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">Min. payout ₹500 via UPI or Bank</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-500" />
            <span>Held in Escrow (7 Days)</span>
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-amber-700">
            ₹{pendingHoldAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">Releases 7 days post-sale</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            Lifetime Net Earnings
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-rose-900">
            ₹{totalEarnedAmount.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">Your 90% share of gross revenue</span>
        </div>
      </div>

      {/* PAYOUT REQUEST MODAL */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Request Creator Payout</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            {payoutSuccess ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-serif text-base font-bold text-emerald-900">Payout Request Submitted!</h4>
                <p className="text-xs text-emerald-700">
                  ₹{payoutAmount.toLocaleString()} will be disbursed to your {payoutMethod.toUpperCase()} account within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Withdrawal Amount (₹)</label>
                  <input
                    type="number"
                    min={500}
                    max={availableAmount}
                    required
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-bold text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-stone-500">Available: ₹{availableAmount.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payout Destination</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("upi")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold cursor-pointer ${
                        payoutMethod === "upi" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-700"
                      }`}
                    >
                      <Smartphone className="h-4 w-4" />
                      <span>Instant UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutMethod("bank")}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 font-bold cursor-pointer ${
                        payoutMethod === "bank" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-stone-200 text-stone-700"
                      }`}
                    >
                      <Landmark className="h-4 w-4" />
                      <span>Bank NEFT</span>
                    </button>
                  </div>
                </div>

                {payoutMethod === "upi" ? (
                  <div>
                    <label className="block font-semibold mb-1">UPI ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Account Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 50100234567890"
                        value={bankAcc}
                        onChange={(e) => setBankAcc(e.target.value)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">IFSC Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. HDFC0001234"
                        value={bankIfsc}
                        onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-mono focus:bg-white focus:border-rose-500 focus:outline-none uppercase"
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-900 flex items-center justify-between">
                  <span>Platform Fee on Payout:</span>
                  <span className="font-bold">₹0 (Zero Fees)</span>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 font-bold text-white transition-colors cursor-pointer shadow-xs"
                >
                  Confirm &amp; Disburse Payout
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

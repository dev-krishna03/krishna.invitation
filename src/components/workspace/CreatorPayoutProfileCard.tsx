"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Edit2,
  Save,
  Building2,
  CreditCard,
} from "lucide-react";

type PayoutProfile = {
  id?: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  upi_id?: string | null;
  pan_number?: string | null;
  payout_preference: "BANK" | "UPI";
  is_verified?: boolean;
};

export function CreatorPayoutProfileCard() {
  const [profile, setProfile] = useState<PayoutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState<PayoutProfile>({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    upi_id: "",
    pan_number: "",
    payout_preference: "BANK",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/payout-profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setForm({
          account_holder_name: data.profile.account_holder_name || "",
          bank_name: data.profile.bank_name || "",
          account_number: data.profile.account_number || "",
          ifsc_code: data.profile.ifsc_code || "",
          upi_id: data.profile.upi_id || "",
          pan_number: data.profile.pan_number || "",
          payout_preference: data.profile.payout_preference || "BANK",
        });
      } else {
        setIsEditing(true); // default open if not created yet
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch("/api/workspace/payout-profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save bank details");
      setProfile(data.profile);
      setIsEditing(false);
      setToast({ type: "success", message: "Bank account & payout details saved securely." });
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error saving details" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-5">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-3.5 text-xs font-medium ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 shadow-2xs">
            <Landmark className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Bank Account & Settlement Details
              </h3>
              {profile && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500">
              Where your 90% template earnings are deposited via IMPS / NEFT or UPI.
            </p>
          </div>
        </div>

        {!isEditing && profile && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-700 cursor-pointer shadow-2xs"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit Bank Details
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400">Loading payout profile...</div>
      ) : isEditing ? (
        /* Edit Form */
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                Account Holder Name
              </label>
              <input
                type="text"
                required
                placeholder="Name as per Bank records"
                value={form.account_holder_name}
                onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                Bank Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                Account Number
              </label>
              <input
                type="text"
                required
                placeholder="Enter bank account number"
                value={form.account_number}
                onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                IFSC Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC0001234"
                value={form.ifsc_code}
                onChange={(e) => setForm({ ...form, ifsc_code: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                UPI ID (Virtual Payment Address)
              </label>
              <input
                type="text"
                placeholder="e.g. creator@okhdfcbank"
                value={form.upi_id || ""}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">For instant UPI withdrawal requests</span>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                PAN Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={form.pan_number || ""}
                onChange={(e) => setForm({ ...form, pan_number: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 focus:border-stone-900 focus:outline-hidden"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Required for TDS compliance above ₹15,000/yr</span>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            {profile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-black px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Bank Details
            </button>
          </div>
        </form>
      ) : (
        /* Saved View */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Beneficiary Name
            </span>
            <p className="mt-1 text-sm font-bold text-stone-900">{profile?.account_holder_name}</p>
            <span className="text-[11px] text-stone-500">{profile?.bank_name}</span>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Account & IFSC
            </span>
            <p className="mt-1 text-sm font-mono font-bold text-stone-900">
              •••• {profile?.account_number.slice(-4)}
            </p>
            <span className="text-[11px] font-mono text-stone-500">IFSC: {profile?.ifsc_code}</span>
          </div>

          <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Instant UPI Handle
            </span>
            <p className="mt-1 text-sm font-bold text-emerald-800">
              {profile?.upi_id || "Not configured"}
            </p>
            <span className="text-[11px] text-stone-500">
              PAN: {profile?.pan_number ? `${profile.pan_number.slice(0, 5)}••••` : "Not provided"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

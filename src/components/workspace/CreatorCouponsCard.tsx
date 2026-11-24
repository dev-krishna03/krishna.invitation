"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Percent,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  UserCheck,
  Users,
} from "lucide-react";

type CouponData = {
  id: string;
  code: string;
  name: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  first_time_only: boolean;
  allowed_days_of_week: number[];
  max_discount_amount: number | null;
  is_active: boolean;
  template?: {
    id: string;
    name: string;
    price: number | null;
  } | null;
};

type MyTemplate = {
  id: string;
  name: string;
  price: number | null;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CreatorCouponsCard() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [templates, setTemplates] = useState<MyTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Coupon form
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState(25);
  const [templateId, setTemplateId] = useState("");
  const [maxUses, setMaxUses] = useState<string>("50");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [dayType, setDayType] = useState<"ALL" | "WEEKENDS">("ALL");
  const [validFrom, setValidFrom] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");

  useEffect(() => {
    fetchCoupons();
    fetchTemplates();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/workspace/templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(
          data.templates.map((t: any) => ({
            id: t.id,
            name: t.name,
            price: t.price,
          })),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setToast(null);

    const days = dayType === "WEEKENDS" ? [0, 6] : [];

    try {
      const res = await fetch("/api/workspace/coupons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          name: name || null,
          type,
          value: Number(value),
          template_id: templateId ? templateId : null,
          max_uses: maxUses ? parseInt(maxUses) : null,
          max_discount_amount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
          first_time_only: firstTimeOnly,
          allowed_days_of_week: days,
          valid_from: validFrom ? new Date(validFrom).toISOString() : null,
          valid_until: validUntil ? new Date(validUntil).toISOString() : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setToast({ type: "success", message: `Coupon ${data.coupon.code} created successfully!` });
      setIsModalOpen(false);
      resetForm();
      await fetchCoupons();
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Creation failed" });
    } finally {
      setCreating(false);
    }
  }

  function resetForm() {
    setCode("");
    setName("");
    setValue(25);
    setMaxUses("50");
    setMaxDiscountAmount("");
    setFirstTimeOnly(false);
    setDayType("ALL");
    setValidFrom("");
    setValidUntil("");
  }

  async function handleToggleStatus(coupon: CouponData) {
    try {
      const res = await fetch(`/api/workspace/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/workspace/coupons/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchCoupons();
      setToast({ type: "success", message: "Coupon deleted successfully." });
    } catch (e) {
      setToast({ type: "error", message: "Failed to delete coupon" });
    }
  }

  // Simulator helper for creator UI
  const samplePrice = 500;
  const rawDiscount =
    type === "PERCENTAGE" ? Math.round((samplePrice * value) / 100) : Math.min(samplePrice, value);
  const sampleDiscount =
    maxDiscountAmount && rawDiscount > parseInt(maxDiscountAmount)
      ? parseInt(maxDiscountAmount)
      : rawDiscount;
  const sampleHostPays = Math.max(0, samplePrice - sampleDiscount);
  const sampleAdminFee = Math.round((samplePrice * 10) / 100); // 10% on base
  const sampleCreatorReceives = Math.max(0, sampleHostPays - sampleAdminFee);

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs space-y-6">
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
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-2xs">
            <Tag className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              My Coupons & Promotional Discounts
            </h3>
            <p className="text-xs text-stone-500">
              Create scheduled, day-wise, and audience-targeted promotional discounts for your templates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create New Coupon
        </button>
      </div>

      {/* Formula Explanation Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-700 space-y-1">
          <p className="font-bold text-stone-900">
            Platform Fee Calculation Rule
          </p>
          <p className="text-[11px] leading-relaxed text-stone-600">
            When you offer a promotional coupon (e.g. <strong>25% OFF</strong> on a <strong>₹500</strong> template), the host pays <strong>₹375</strong>.
            The platform fee is <strong>10% calculated on the base price (₹500)</strong>, which is <strong>₹50</strong>.
            You receive <strong>₹325</strong> (the creator absorbs the discount).
          </p>
        </div>
      </div>

      {/* Coupons Table / List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-stone-400">Loading coupons...</div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-200 p-8 text-center">
          <Tag className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-2 text-sm font-semibold text-stone-700">No promotional coupons created yet</p>
          <p className="mt-1 text-xs text-stone-400">
            Create your first coupon (e.g. KRISHNA25 for 25% off) to share with your audience.
          </p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coupons.map((c) => {
            const now = new Date();
            const isExpired = c.valid_until && new Date(c.valid_until) < now;
            const isScheduled = c.valid_from && new Date(c.valid_from) > now;

            return (
              <div
                key={c.id}
                className={`rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                  c.is_active && !isExpired
                    ? "border-stone-200 bg-white"
                    : "border-stone-200 bg-stone-50/70 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                        {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        !c.is_active
                          ? "bg-stone-200 text-stone-600"
                          : isExpired
                          ? "bg-rose-100 text-rose-800"
                          : isScheduled
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {!c.is_active ? "Paused" : isExpired ? "Expired" : isScheduled ? "Scheduled" : "Active"}
                    </span>
                  </div>

                  {c.name && <p className="mt-2 text-xs font-semibold text-stone-800">{c.name}</p>}

                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">Applies to:</span>
                      <span className="font-medium text-stone-800">
                        {c.template?.name || "All My Templates"}
                      </span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-stone-400">Redemptions:</span>
                      <span className="font-medium text-stone-800">
                        {c.used_count} {c.max_uses ? `/ ${c.max_uses} used` : "uses (unlimited)"}
                      </span>
                    </p>
                    {c.first_time_only && (
                      <p className="flex items-center justify-between">
                        <span className="text-stone-400">Target:</span>
                        <span className="font-medium text-violet-700">First-time buyers only</span>
                      </p>
                    )}
                    {c.allowed_days_of_week && c.allowed_days_of_week.length > 0 && (
                      <p className="flex items-center justify-between">
                        <span className="text-stone-400">Days:</span>
                        <span className="font-medium text-amber-800">
                          {c.allowed_days_of_week.map((d) => DAY_NAMES[d]).join(", ")} only
                        </span>
                      </p>
                    )}
                    {c.valid_until && (
                      <p className="flex items-center justify-between">
                        <span className="text-stone-400">Valid until:</span>
                        <span className="font-medium text-stone-800">
                          {new Date(c.valid_until).toLocaleDateString()}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(c)}
                    className="text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    {c.is_active ? "Pause Coupon" : "Resume Coupon"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 text-stone-900 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-rose-600" />
                <h3 className="font-serif text-lg font-bold text-stone-900">Create Advanced Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FESTIVE25"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wedding Season Flash"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Value {type === "PERCENTAGE" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === "PERCENTAGE" ? 90 : 5000}
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Max Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="No cap"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  Target Template
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800"
                >
                  <option value="">All My Templates</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.price ? `(₹${t.price})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day-Wise & User Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Day-Wise Rule
                  </label>
                  <select
                    value={dayType}
                    onChange={(e) => setDayType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                  >
                    <option value="ALL">All 7 Days</option>
                    <option value="WEEKENDS">Weekends Only (Sat/Sun)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Max Redemptions (Users)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="firstTime"
                  checked={firstTimeOnly}
                  onChange={(e) => setFirstTimeOnly(e.target.checked)}
                  className="rounded accent-rose-600"
                />
                <label htmlFor="firstTime" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Limit to first-time buyers only
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              {/* Dynamic split preview box */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2 text-xs">
                <span className="font-bold text-stone-800 block flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                  Estimated Split on ₹500 Template Sale
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-stone-200">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Host Pays</span>
                    <span className="font-bold text-stone-900">₹{sampleHostPays}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Admin 10% Fee</span>
                    <span className="font-bold text-stone-900">₹{sampleAdminFee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold block">You Receive</span>
                    <span className="font-bold text-emerald-800">₹{sampleCreatorReceives}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

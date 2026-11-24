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
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Search,
  Filter,
  DollarSign,
  ArrowRight,
  UserCheck,
} from "lucide-react";

type CouponData = {
  id: string;
  code: string;
  name: string | null;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  max_uses: number | null;
  used_count: number;
  max_uses_per_user: number | null;
  min_amount: number | null;
  max_discount_amount: number | null;
  first_time_only: boolean;
  allowed_user_emails: string[];
  allowed_days_of_week: number[];
  time_start: string | null;
  time_end: string | null;
  scope: string;
  category_filter: string | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  creator_user_id: string | null;
  template_id: string | null;
  created_at: string;
  creator?: { id: string; name: string | null; email: string } | null;
  template?: { id: string; name: string; price: number | null; category: string } | null;
  _count?: { payments: number };
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AdminCouponsView() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"ALL" | "ADMIN" | "CREATOR">("ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState(25);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [scope, setScope] = useState<"ALL" | "ADMIN_TEMPLATES" | "CREATOR_TEMPLATES" | "CATEGORY">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [maxUses, setMaxUses] = useState<string>("50");
  const [maxUsesPerUser, setMaxUsesPerUser] = useState<number>(1);
  const [firstTimeOnly, setFirstTimeOnly] = useState(false);
  const [userTargeting, setUserTargeting] = useState<"ALL" | "FIRST_TIME" | "SPECIFIC">("ALL");
  const [allowedEmails, setAllowedEmails] = useState("");
  const [dayTargeting, setDayTargeting] = useState<"ALL" | "WEEKENDS" | "CUSTOM">("ALL");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setToast(null);

    let days: number[] = [];
    if (dayTargeting === "WEEKENDS") days = [0, 6];
    else if (dayTargeting === "CUSTOM") days = selectedDays;

    const emails =
      userTargeting === "SPECIFIC" && allowedEmails
        ? allowedEmails
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.includes("@"))
        : [];

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          name: name || null,
          type,
          value: Number(value),
          scope,
          category_filter: scope === "CATEGORY" ? categoryFilter : null,
          max_discount_amount: maxDiscountAmount ? parseInt(maxDiscountAmount) : null,
          min_amount: minAmount ? parseInt(minAmount) : null,
          max_uses: maxUses ? parseInt(maxUses) : null,
          max_uses_per_user: maxUsesPerUser,
          first_time_only: userTargeting === "FIRST_TIME" || firstTimeOnly,
          allowed_user_emails: emails,
          allowed_days_of_week: days,
          valid_from: validFrom ? new Date(validFrom).toISOString() : null,
          valid_until: validUntil ? new Date(validUntil).toISOString() : null,
          time_start: timeStart || null,
          time_end: timeEnd || null,
          is_active: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create coupon");

      setToast({ type: "success", message: `Advanced coupon '${data.coupon.code}' created successfully.` });
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
    setType("PERCENTAGE");
    setValue(25);
    setMaxDiscountAmount("");
    setMinAmount("");
    setScope("ALL");
    setCategoryFilter("");
    setMaxUses("50");
    setMaxUsesPerUser(1);
    setFirstTimeOnly(false);
    setUserTargeting("ALL");
    setAllowedEmails("");
    setDayTargeting("ALL");
    setSelectedDays([]);
    setValidFrom("");
    setValidUntil("");
    setTimeStart("");
    setTimeEnd("");
  }

  async function handleToggle(c: CouponData) {
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      await fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(c: CouponData) {
    if (!confirm(`Are you sure you want to delete coupon '${c.code}'?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setToast({ type: "success", message: `Coupon ${c.code} deleted.` });
      await fetchCoupons();
    } catch (e) {
      setToast({ type: "error", message: "Failed to delete coupon" });
    }
  }

  const filteredCoupons = coupons.filter((c) => {
    if (filterTab === "ADMIN" && c.creator_user_id !== null) return false;
    if (filterTab === "CREATOR" && c.creator_user_id === null) return false;
    if (search) {
      const q = search.toLowerCase();
      const codeMatch = c.code.toLowerCase().includes(q);
      const nameMatch = c.name?.toLowerCase().includes(q) || false;
      const creatorMatch = c.creator?.email.toLowerCase().includes(q) || false;
      return codeMatch || nameMatch || creatorMatch;
    }
    return true;
  });

  return (
    <div className="space-y-7">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-xs font-medium shadow-xs transition-all ${
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-800">
            <Tag className="h-3 w-3" />
            Promotions & Revenue Operations
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Advanced Coupons & Discounts Engine
          </h1>
          <p className="mt-1 text-sm text-stone-500 max-w-2xl">
            Configure scheduled, day-wise, user-wise, and template-targeted promotions for official and creator templates.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-700 hover:bg-violet-800 px-4 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Advanced Promotion
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Active Promotions</span>
          <p className="mt-1 font-serif text-2xl font-bold text-stone-900">
            {coupons.filter((c) => c.is_active).length}
          </p>
          <span className="text-[11px] text-stone-500">{coupons.length} total codes created</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Admin Official Promos</span>
          <p className="mt-1 font-serif text-2xl font-bold text-violet-800">
            {coupons.filter((c) => c.creator_user_id === null).length}
          </p>
          <span className="text-[11px] text-stone-500">Platform-wide & official templates</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Creator Custom Promos</span>
          <p className="mt-1 font-serif text-2xl font-bold text-rose-800">
            {coupons.filter((c) => c.creator_user_id !== null).length}
          </p>
          <span className="text-[11px] text-stone-500">Marketplace designer coupons</span>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Redemptions</span>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
            {coupons.reduce((acc, c) => acc + c.used_count, 0)}
          </p>
          <span className="text-[11px] text-stone-500">Guest orders converted</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === "ALL" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            All Coupons ({coupons.length})
          </button>
          <button
            onClick={() => setFilterTab("ADMIN")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === "ADMIN" ? "bg-white text-violet-800 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Admin Promotions ({coupons.filter((c) => c.creator_user_id === null).length})
          </button>
          <button
            onClick={() => setFilterTab("CREATOR")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filterTab === "CREATOR" ? "bg-white text-rose-800 shadow-2xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Creator Promos ({coupons.filter((c) => c.creator_user_id !== null).length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by code, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-white pl-8 pr-3 py-1.5 text-xs text-stone-900 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Coupons List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading coupons and promotions...</div>
      ) : filteredCoupons.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-stone-300 p-12 text-center bg-white">
          <Tag className="mx-auto h-8 w-8 text-stone-300" />
          <p className="mt-2 text-sm font-semibold text-stone-800">No promotions found matching criteria</p>
          <p className="mt-1 text-xs text-stone-400">Create your first advanced promotion to start driving sales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCoupons.map((c) => {
            const isAdmin = c.creator_user_id === null;
            const now = new Date();
            const isExpired = c.valid_until && new Date(c.valid_until) < now;
            const isScheduled = c.valid_from && new Date(c.valid_from) > now;

            return (
              <div
                key={c.id}
                className={`rounded-3xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all ${
                  c.is_active && !isExpired
                    ? isAdmin
                      ? "border-violet-200"
                      : "border-stone-200"
                    : "border-stone-200 opacity-60 bg-stone-50"
                }`}
              >
                <div className="space-y-3.5">
                  {/* Top line: Code, badge, and scope */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-sm font-bold tracking-wider px-2.5 py-0.5 rounded-lg border ${
                            isAdmin
                              ? "bg-violet-50 text-violet-800 border-violet-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {c.code}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isAdmin
                              ? "bg-violet-100 text-violet-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {isAdmin ? "Admin Official" : "Creator"}
                        </span>
                      </div>
                      {c.name && <p className="mt-1 text-xs font-semibold text-stone-800">{c.name}</p>}
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        !c.is_active
                          ? "bg-stone-200 text-stone-600"
                          : isExpired
                          ? "bg-rose-100 text-rose-800"
                          : isScheduled
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {!c.is_active
                        ? "Paused"
                        : isExpired
                        ? "Expired"
                        : isScheduled
                        ? "Scheduled"
                        : "Active"}
                    </span>
                  </div>

                  {/* Discount & Cap */}
                  <div className="rounded-2xl bg-stone-50/80 p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Discount Value
                      </span>
                      <span className="font-serif text-lg font-bold text-stone-900">
                        {c.type === "PERCENTAGE" ? `${c.value}% OFF` : `₹${c.value} OFF`}
                      </span>
                    </div>
                    {c.max_discount_amount && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                          Max Cap
                        </span>
                        <span className="text-xs font-bold text-stone-700">
                          ₹{c.max_discount_amount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rules & Targeting Badges */}
                  <div className="space-y-1.5 text-[11px] text-stone-600">
                    {/* User-Wise Badge */}
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <UserCheck className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>
                        {c.first_time_only
                          ? "First-time buyers only"
                          : c.allowed_user_emails.length > 0
                          ? `Restricted to ${c.allowed_user_emails.length} VIP emails`
                          : "Valid for all users"}{" "}
                        ({c.max_uses_per_user ?? 1} per customer)
                      </span>
                    </div>

                    {/* Day-Wise / Schedule Badge */}
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Calendar className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>
                        {c.allowed_days_of_week && c.allowed_days_of_week.length > 0
                          ? `Days: ${c.allowed_days_of_week.map((d) => DAY_NAMES[d]).join(", ")}`
                          : "Valid all 7 days"}
                        {c.valid_until && ` · Exp: ${new Date(c.valid_until).toLocaleDateString()}`}
                      </span>
                    </div>

                    {/* Redemptions Progress */}
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Users className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                      <span>
                        {c.used_count} redeemed {c.max_uses ? `/ ${c.max_uses} max limit` : "(unlimited)"}
                      </span>
                    </div>

                    {/* Scope / Template */}
                    <div className="pt-1 text-[10px] text-stone-400 flex items-center justify-between">
                      <span>Scope: {c.scope}</span>
                      {c.creator && <span>By: {c.creator.name || c.creator.email.split("@")[0]}</span>}
                      {c.template && <span>Template: {c.template.name}</span>}
                    </div>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggle(c)}
                    className="font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    {c.is_active ? "Pause Coupon" : "Activate"}
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
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

      {/* ADVANCED CREATE PROMOTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 my-8 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 text-white shadow-xs">
                  <Tag className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Create Advanced Promotion / Coupon
                  </h3>
                  <p className="text-xs text-stone-500">Configure user-wise, day-wise, and template-targeted rules.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DIWALI30, WELCOME50"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono font-bold text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Campaign Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Weekend Flash Sale"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Discount Value & Scope */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Discount Value {type === "PERCENTAGE" ? "(%)" : "(₹)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={type === "PERCENTAGE" ? 90 : 50000}
                    value={value}
                    onChange={(e) => setValue(parseInt(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Max Discount Cap (₹)
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

              {/* Scope & Applicability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Template Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800"
                  >
                    <option value="ALL">All Platform Templates</option>
                    <option value="ADMIN_TEMPLATES">Official Balcony Templates Only</option>
                    <option value="CREATOR_TEMPLATES">Creator Marketplace Templates</option>
                    <option value="CATEGORY">Specific Occasion Category</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Minimum Order Spend (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. ₹500"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </div>
              </div>

              {scope === "CATEGORY" && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Target Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800"
                  >
                    <option value="WEDDING">Wedding</option>
                    <option value="ENGAGEMENT">Engagement</option>
                    <option value="BIRTHDAY">Birthday</option>
                    <option value="CORPORATE">Corporate</option>
                    <option value="ANNIVERSARY">Anniversary</option>
                    <option value="FESTIVAL">Festival</option>
                  </select>
                </div>
              )}

              {/* USER-WISE RULES */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-violet-700" />
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    User-Wise Targeting Rules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUserTargeting("ALL")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      userTargeting === "ALL" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">All Users</span>
                    <span className="text-[10px] text-stone-500">Public redemption</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserTargeting("FIRST_TIME")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      userTargeting === "FIRST_TIME" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">First-Time Buyers</span>
                    <span className="text-[10px] text-stone-500">Welcome coupon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserTargeting("SPECIFIC")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      userTargeting === "SPECIFIC" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">Specific VIP Emails</span>
                    <span className="text-[10px] text-stone-500">Restricted whitelist</span>
                  </button>
                </div>

                {userTargeting === "SPECIFIC" && (
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Allowed User Emails (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="vip@domain.com, guest@wedding.com"
                      value={allowedEmails}
                      onChange={(e) => setAllowedEmails(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-900"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-stone-600">Per-user redemption limit:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={maxUsesPerUser}
                      onChange={(e) => setMaxUsesPerUser(parseInt(e.target.value) || 1)}
                      className="w-16 rounded-xl border border-stone-200 bg-white px-2 py-1 text-xs text-center font-bold"
                    />
                    <span className="text-xs text-stone-500">use(s) per account</span>
                  </div>
                </div>
              </div>

              {/* DAY-WISE & SCHEDULE RULES */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-violet-700" />
                  <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                    Day-Wise & Scheduling Rules
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDayTargeting("ALL")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      dayTargeting === "ALL" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">All 7 Days</span>
                    <span className="text-[10px] text-stone-500">Every day of week</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDayTargeting("WEEKENDS")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      dayTargeting === "WEEKENDS" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">Weekends Only</span>
                    <span className="text-[10px] text-stone-500">Saturday & Sunday</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDayTargeting("CUSTOM")}
                    className={`rounded-xl border p-2.5 text-xs font-semibold cursor-pointer text-left ${
                      dayTargeting === "CUSTOM" ? "border-violet-700 bg-violet-50 text-violet-900" : "border-stone-200 bg-white text-stone-700"
                    }`}
                  >
                    <span className="block font-bold">Custom Days</span>
                    <span className="text-[10px] text-stone-500">Pick specific days</span>
                  </button>
                </div>

                {dayTargeting === "CUSTOM" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {DAY_NAMES.map((name, idx) => {
                      const isSelected = selectedDays.includes(idx);
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            if (isSelected) setSelectedDays(selectedDays.filter((d) => d !== idx));
                            else setSelectedDays([...selectedDays, idx]);
                          }}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-violet-700 text-white border-violet-700"
                              : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Scheduled Start (Valid From)
                    </label>
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                      Scheduled End (Valid Until)
                    </label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* NUMBER OF USERS WISE */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-stone-900 block flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-violet-700" />
                    Max Total Redemptions (Number of Users Limit)
                  </span>
                  <span className="text-[11px] text-stone-500">
                    e.g. Valid only for the first 50 customers to redeem.
                  </span>
                </div>
                <input
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className="w-24 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-center text-stone-900"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Tag className="h-3.5 w-3.5" />}
                  Create Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

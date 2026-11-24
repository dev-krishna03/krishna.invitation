"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Percent,
  Sliders,
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
  ExternalLink,
  Layers,
} from "lucide-react";

type GatewayData = {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  is_active: boolean;
  environment: "TEST" | "LIVE";
  webhook_secret: string | null;
  credentials: Record<string, string>;
  updated_at: string;
};

type PlatformFeeConfig = {
  fee_percentage: number;
  calculate_on_base_price: boolean;
  min_fee_inr?: number;
  description?: string;
};

export function GatewaysManagementView() {
  const [gateways, setGateways] = useState<GatewayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states per gateway
  const [formData, setFormData] = useState<
    Record<
      string,
      {
        key_id: string;
        key_secret: string;
        webhook_secret: string;
        environment: "TEST" | "LIVE";
        is_active: boolean;
        showSecret: boolean;
      }
    >
  >({});

  // Super Admin Platform Fee Config
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfig>({
    fee_percentage: 10,
    calculate_on_base_price: true,
    min_fee_inr: 0,
    description: "10% platform fee on template base price. Creator absorbs discount.",
  });
  const [savingFee, setSavingFee] = useState(false);

  // Live Simulator state
  const [simBasePrice, setSimBasePrice] = useState(500);
  const [simDiscountPct, setSimDiscountPct] = useState(25);

  useEffect(() => {
    fetchGateways();
    fetchFeeConfig();
  }, []);

  async function fetchGateways() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gateways");
      const json = await res.json();
      if (json.gateways) {
        setGateways(json.gateways);
        const forms: Record<string, any> = {};
        for (const g of json.gateways) {
          forms[g.id] = {
            key_id: g.credentials?.key_id || "",
            key_secret: g.credentials?.key_secret || "",
            webhook_secret: g.webhook_secret || "",
            environment: g.environment || "TEST",
            is_active: g.is_active || false,
            showSecret: false,
          };
        }
        setFormData(forms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeeConfig() {
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      const setting = json.settings?.find((s: any) => s.key === "platform_fee_config");
      if (setting?.value) {
        setFeeConfig({
          fee_percentage: setting.value.fee_percentage ?? 10,
          calculate_on_base_price: setting.value.calculate_on_base_price ?? true,
          min_fee_inr: setting.value.min_fee_inr ?? 0,
          description: setting.value.description ?? "",
        });
      }
    } catch (e) {
      console.error("Failed to fetch fee config", e);
    }
  }

  async function handleSaveGateway(g: GatewayData) {
    setSavingId(g.id);
    setToast(null);
    try {
      const f = formData[g.id];
      const res = await fetch(`/api/admin/gateways/${g.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          is_active: f.is_active,
          environment: f.environment,
          webhook_secret: f.webhook_secret,
          credentials: {
            key_id: f.key_id,
            key_secret: f.key_secret,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to save credentials");
      setToast({ type: "success", message: `${g.display_name} configuration saved successfully.` });
      await fetchGateways();
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error saving gateway" });
    } finally {
      setSavingId(null);
    }
  }

  async function handleTestGateway(g: GatewayData) {
    setTestingId(g.id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/admin/gateways/${g.id}/test`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({ id: g.id, ok: true, msg: "Razorpay API test successful! Order creation verified." });
      } else {
        setTestResult({ id: g.id, ok: false, msg: data.error || "Connection test failed. Check Key ID & Secret." });
      }
    } catch (e) {
      setTestResult({ id: g.id, ok: false, msg: e instanceof Error ? e.message : "Connection failed." });
    } finally {
      setTestingId(null);
    }
  }

  async function handleSaveFeeConfig(e: React.FormEvent) {
    e.preventDefault();
    setSavingFee(true);
    setToast(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key: "platform_fee_config",
          value: feeConfig,
        }),
      });
      if (!res.ok) throw new Error("Failed to save platform fee setting");
      setToast({ type: "success", message: `Platform Fee updated to ${feeConfig.fee_percentage}% with base-price calculation active.` });
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSavingFee(false);
    }
  }

  // Calculate live simulator values
  const simDiscountAmt = Math.round((simBasePrice * simDiscountPct) / 100);
  const simHostPays = Math.max(0, simBasePrice - simDiscountAmt);
  const simFeeBase = feeConfig.calculate_on_base_price ? simBasePrice : simHostPays;
  const simPlatformFee = Math.round((simFeeBase * feeConfig.fee_percentage) / 100);
  const simCreatorReceives = Math.max(0, simHostPays - simPlatformFee);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium shadow-sm transition-all ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-800">
            <CreditCard className="h-3 w-3" />
            Payment Infrastructure & Gateways
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Payment Gateways & Razorpay Credentials
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Configure live Razorpay credentials, toggle test/live sandbox, and manage platform fee cut.
          </p>
        </div>

        <button
          onClick={fetchGateways}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* PLATFORM FEE CONFIGURATION & REVENUE SPLIT ENGINE */}
      <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-violet-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-700 text-white shadow-xs">
                <Percent className="h-4 w-4" />
              </span>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Platform Fee & Revenue Split Configuration
              </h2>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Define the platform commission percentage. When creators provide discount coupons (e.g. 25% off),
              the platform fee is calculated on the <strong>full template base price</strong> so platform revenue is fully protected.
            </p>
          </div>

          <button
            onClick={handleSaveFeeConfig}
            disabled={savingFee}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 hover:bg-violet-800 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-60 shrink-0"
          >
            {savingFee ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Save Platform Fee Setting
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Platform Commission (%)
                </label>
                <span className="font-serif text-lg font-bold text-violet-800">
                  {feeConfig.fee_percentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={feeConfig.fee_percentage}
                onChange={(e) =>
                  setFeeConfig({ ...feeConfig, fee_percentage: parseInt(e.target.value) || 0 })
                }
                className="mt-2 w-full accent-violet-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-medium">
                <span>0% (Free)</span>
                <span>10% (Standard)</span>
                <span>20%</span>
                <span>30%</span>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-white p-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feeConfig.calculate_on_base_price}
                  onChange={(e) =>
                    setFeeConfig({ ...feeConfig, calculate_on_base_price: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-violet-700 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Calculate Fee on Base Price (Creator Absorbs Discount)
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-0.5 leading-relaxed">
                    If template is ₹500 with 25% coupon (host pays ₹375), admin 10% fee is ₹50 (10% of ₹500). Creator receives ₹325.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Interactive Live Financial Simulator */}
          <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Live Financial Simulator (User Formula Verification)
                </span>
              </div>
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                Formula Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block">Template Price (₹)</label>
                <input
                  type="number"
                  value={simBasePrice}
                  onChange={(e) => setSimBasePrice(Math.max(100, parseInt(e.target.value) || 0))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-600 block">Creator Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="90"
                  value={simDiscountPct}
                  onChange={(e) => setSimDiscountPct(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold text-stone-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100 text-center">
              <div className="rounded-xl bg-stone-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Base Price</span>
                <span className="text-sm font-bold text-stone-800">₹{simBasePrice}</span>
              </div>
              <div className="rounded-xl bg-amber-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-amber-600 block">Discount ({simDiscountPct}%)</span>
                <span className="text-sm font-bold text-amber-700">-₹{simDiscountAmt}</span>
              </div>
              <div className="rounded-xl bg-sky-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-sky-600 block">Host Pays</span>
                <span className="text-sm font-bold text-sky-800">₹{simHostPays}</span>
              </div>
              <div className="rounded-xl bg-purple-50 p-2.5">
                <span className="text-[10px] uppercase font-bold text-purple-700 block">Platform (10%)</span>
                <span className="text-sm font-bold text-purple-800">₹{simPlatformFee}</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Net Creator Earnings
                </span>
                <span className="text-[11px] text-emerald-700">
                  Host Pays (₹{simHostPays}) - Admin 10% Fee (₹{simPlatformFee})
                </span>
              </div>
              <span className="font-serif text-xl font-bold text-emerald-800">
                ₹{simCreatorReceives}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* GATEWAYS LIST (RAZORPAY AS PRIMARY) */}
      <div className="space-y-6">
        <h2 className="font-serif text-xl font-bold text-stone-900">Configured Payment Gateways</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {gateways.map((g) => {
            const form = formData[g.id] || {
              key_id: "",
              key_secret: "",
              webhook_secret: "",
              environment: "TEST",
              is_active: false,
              showSecret: false,
            };
            const isRazorpay = g.slug === "razorpay";

            return (
              <div
                key={g.id}
                className={`rounded-3xl border bg-white p-6 shadow-xs flex flex-col justify-between transition-all ${
                  form.is_active
                    ? "border-violet-300 ring-2 ring-violet-200"
                    : "border-stone-200 opacity-95"
                }`}
              >
                <div className="space-y-5">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isRazorpay ? "bg-violet-100 text-violet-800" : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                          {g.display_name}
                          {isRazorpay && (
                            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
                              Primary Gateway
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-stone-500">ID: {g.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          form.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {form.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Active toggle & Environment */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Status
                        </label>
                        <select
                          value={form.is_active ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [g.id]: { ...form, is_active: e.target.value === "active" },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="active">Active (Default Checkout)</option>
                          <option value="inactive">Disabled</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Environment Mode
                        </label>
                        <select
                          value={form.environment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [g.id]: { ...form, environment: e.target.value as "TEST" | "LIVE" },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="TEST">TEST (Sandbox)</option>
                          <option value="LIVE">LIVE (Production)</option>
                        </select>
                      </div>
                    </div>

                    {/* Key ID */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        {isRazorpay ? "Razorpay Key ID" : "API Key / App ID"}
                      </label>
                      <input
                        type="text"
                        placeholder={isRazorpay ? "rzp_test_..." : "Enter key id"}
                        value={form.key_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [g.id]: { ...form, key_id: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                      />
                    </div>

                    {/* Key Secret */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          {isRazorpay ? "Razorpay Key Secret" : "API Secret"}
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              [g.id]: { ...form, showSecret: !form.showSecret },
                            })
                          }
                          className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                        >
                          {form.showSecret ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{form.showSecret ? "Hide" : "Show"}</span>
                        </button>
                      </div>
                      <input
                        type={form.showSecret ? "text" : "password"}
                        placeholder={g.credentials?.key_secret ? "••••••••••••••••" : "Enter secret"}
                        value={form.key_secret}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [g.id]: { ...form, key_secret: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                      />
                    </div>

                    {/* Webhook Secret */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Webhook Secret (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Webhook signing secret"
                        value={form.webhook_secret}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [g.id]: { ...form, webhook_secret: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                      />
                    </div>

                    {/* Test result display */}
                    {testResult && testResult.id === g.id && (
                      <div
                        className={`rounded-xl p-3 text-xs flex items-start gap-2 ${
                          testResult.ok
                            ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                            : "bg-rose-50 text-rose-900 border border-rose-200"
                        }`}
                      >
                        {testResult.ok ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{testResult.msg}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleTestGateway(g)}
                    disabled={testingId === g.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${testingId === g.id ? "animate-spin" : ""}`} />
                    Test Connection
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveGateway(g)}
                    disabled={savingId === g.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingId === g.id ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Lock className="h-3.5 w-3.5" />
                    )}
                    Save Credentials
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

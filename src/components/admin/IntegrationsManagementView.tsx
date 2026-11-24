"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Send,
  Lock,
  ExternalLink,
  MessageSquare,
  MapPin,
  Sparkles,
  Database,
  Cloud,
  Key,
  Copy,
  Check,
  CreditCard,
  ArrowRight,
  Phone,
  Settings2,
  Radio,
  Layers,
} from "lucide-react";

type IntegrationData = {
  id: string;
  service_name: string;
  service_slug: string;
  display_name: string;
  is_configured: boolean;
  is_active: boolean;
  environment: "TEST" | "LIVE";
  last_tested_at: string | null;
  test_status: "PASS" | "FAIL" | null;
  credentials: Record<string, string>;
  updated_at: string;
};

interface FormState {
  api_key?: string;
  sender_email?: string;
  sender_name?: string;
  project_url?: string;
  anon_key?: string;
  service_role_key?: string;
  phone_number_id?: string;
  waba_id?: string;
  access_token?: string;
  display_phone_number?: string;
  webhook_verify_token?: string;
  default_template_name?: string;
  test_recipient_phone?: string;
  enable_places?: boolean;
  enable_geocoding?: boolean;
  environment: "TEST" | "LIVE";
  is_active: boolean;
  showKey: boolean;
}

export function IntegrationsManagementView() {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  // Form states per integration id
  const [formData, setFormData] = useState<Record<string, FormState>>({});

  useEffect(() => {
    fetchIntegrations();
    if (typeof window !== "undefined") {
      setWebhookUrl(`${window.location.origin}/api/webhooks/whatsapp`);
    }
  }, []);

  async function fetchIntegrations() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations");
      const json = await res.json();
      if (json.integrations) {
        setIntegrations(json.integrations);
        const forms: Record<string, FormState> = {};
        for (const i of json.integrations) {
          forms[i.id] = {
            api_key: i.credentials?.api_key || "",
            sender_email: i.credentials?.sender_email || "invites@balcony.internal",
            sender_name: i.credentials?.sender_name || "Balcony Invites",
            project_url: i.credentials?.project_url || "",
            anon_key: i.credentials?.anon_key || "",
            service_role_key: i.credentials?.service_role_key || "",
            phone_number_id: i.credentials?.phone_number_id || "",
            waba_id: i.credentials?.waba_id || "",
            access_token: i.credentials?.access_token || "",
            display_phone_number: i.credentials?.display_phone_number || "+91 98765 43210",
            webhook_verify_token:
              i.credentials?.webhook_verify_token || "balcony_whatsapp_webhook_secret_2026",
            default_template_name: i.credentials?.default_template_name || "wedding_invitation_v1",
            test_recipient_phone: "+91 98765 43210",
            enable_places: i.credentials?.enable_places !== "false",
            enable_geocoding: i.credentials?.enable_geocoding !== "false",
            environment: i.environment || "TEST",
            is_active: i.is_active || false,
            showKey: false,
          };
        }
        setFormData(forms);
      }
    } catch (e) {
      console.error("Failed to fetch integrations:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveIntegration(i: IntegrationData) {
    setSavingId(i.id);
    setToast(null);
    try {
      const f = formData[i.id] || { environment: "TEST", is_active: false, showKey: false };
      const credsToSend: Record<string, unknown> = {};

      if (i.service_slug === "brevo") {
        credsToSend.api_key = f.api_key;
        credsToSend.sender_email = f.sender_email;
        credsToSend.sender_name = f.sender_name;
      } else if (i.service_slug === "supabase") {
        credsToSend.project_url = f.project_url;
        credsToSend.anon_key = f.anon_key;
        credsToSend.service_role_key = f.service_role_key;
      } else if (i.service_slug === "whatsapp") {
        credsToSend.phone_number_id = f.phone_number_id;
        credsToSend.waba_id = f.waba_id;
        credsToSend.access_token = f.access_token;
        credsToSend.display_phone_number = f.display_phone_number;
        credsToSend.webhook_verify_token = f.webhook_verify_token;
        credsToSend.default_template_name = f.default_template_name;
      } else if (i.service_slug === "google-maps") {
        credsToSend.api_key = f.api_key;
        credsToSend.enable_places = f.enable_places ?? true;
        credsToSend.enable_geocoding = f.enable_geocoding ?? true;
      } else {
        credsToSend.api_key = f.api_key;
      }

      const res = await fetch(`/api/admin/integrations/${i.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          is_active: f.is_active,
          environment: f.environment,
          credentials: credsToSend,
        }),
      });

      if (!res.ok) throw new Error("Failed to save credentials");
      setToast({ type: "success", message: `${i.display_name} configuration updated and encrypted.` });
      await fetchIntegrations();
    } catch (e) {
      setToast({ type: "error", message: e instanceof Error ? e.message : "Error saving integration" });
    } finally {
      setSavingId(null);
    }
  }

  async function handleTestIntegration(i: IntegrationData, payload?: Record<string, any>) {
    setTestingId(i.id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/admin/integrations/${i.id}/test`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload || {}),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        let successMsg = "Verification passed! Service is responding normally.";
        if (i.service_slug === "brevo") {
          successMsg = "Brevo SMTP connection verified! Test email dispatched successfully to admin inbox.";
        } else if (i.service_slug === "supabase") {
          successMsg = "Supabase connection verified! Storage buckets and database communication active.";
        } else if (i.service_slug === "whatsapp") {
          successMsg = `WhatsApp Business Cloud API verified! Test message dispatched to ${
            payload?.recipient_phone || "designated recipient"
          }.`;
        } else if (i.service_slug === "google-maps") {
          successMsg = "Google Maps Platform verified! Geocoding and Places API endpoints responsive.";
        }

        setTestResult({
          id: i.id,
          ok: true,
          msg: successMsg,
        });
        await fetchIntegrations();
      } else {
        setTestResult({
          id: i.id,
          ok: false,
          msg: data.error || `${i.display_name} verification failed. Please check credentials.`,
        });
      }
    } catch (e) {
      setTestResult({ id: i.id, ok: false, msg: e instanceof Error ? e.message : "Connection failed." });
    } finally {
      setTestingId(null);
    }
  }

  function copyWebhookToClipboard() {
    if (!webhookUrl) return;
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  }

  const brevo = integrations.find((i) => i.service_slug === "brevo");
  const supabase = integrations.find((i) => i.service_slug === "supabase");
  const whatsapp = integrations.find((i) => i.service_slug === "whatsapp");
  const googleMaps = integrations.find((i) => i.service_slug === "google-maps");
  const otherIntegrations = integrations.filter(
    (i) =>
      i.service_slug !== "brevo" &&
      i.service_slug !== "supabase" &&
      i.service_slug !== "whatsapp" &&
      i.service_slug !== "google-maps"
  );

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
            <Radio className="h-3 w-3" />
            External Services &amp; APIs
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Third-Party Services &amp; API Integrations
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage Meta WhatsApp Cloud API, Brevo SMTP, Supabase Cloud Storage, and Google Maps credentials.
          </p>
        </div>

        <button
          onClick={fetchIntegrations}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </button>
      </div>

      {/* RAZORPAY GATEWAY QUICK-LINK BANNER */}
      <div className="rounded-3xl border border-stone-200 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 p-5 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md shrink-0">
            <CreditCard className="h-5 w-5 text-violet-300" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base font-bold text-white">
                Razorpay Payment Gateway &amp; Creator Payouts
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                Central Payouts Active
              </span>
            </div>
            <p className="text-xs text-stone-300 mt-0.5">
              Manage Razorpay API Key ID, Key Secret, platform commission cut (10%), and creator bank/UPI disbursements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href="/krishna/admin/gateways"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto"
          >
            <span>Razorpay Keys</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/krishna/admin/payouts"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors cursor-pointer w-full sm:w-auto"
          >
            <span>Payouts Hub</span>
          </Link>
        </div>
      </div>

      {/* 1. META WHATSAPP BUSINESS CLOUD API MANAGEMENT CARD */}
      {whatsapp && (
        <section className="rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-6 sm:p-8 shadow-sm">
          {(() => {
            const form = formData[whatsapp.id] || {
              phone_number_id: "",
              waba_id: "",
              access_token: "",
              display_phone_number: "+91 98765 43210",
              webhook_verify_token: "balcony_whatsapp_webhook_secret_2026",
              default_template_name: "wedding_invitation_v1",
              test_recipient_phone: "+91 98765 43210",
              environment: "TEST",
              is_active: false,
              showKey: false,
            };

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-emerald-100 pb-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xs shrink-0">
                      <MessageSquare className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-stone-900">
                          Meta WhatsApp Business Cloud API
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            form.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {form.is_active ? "Active" : "Inactive"}
                        </span>
                        {whatsapp.test_status && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              whatsapp.test_status === "PASS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            Cloud API: {whatsapp.test_status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Official Meta Graph API v21.0 integration for luxury wedding invitations, guest RSVP confirmations, and venue navigation blasts.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>Meta Developer Console</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Status & Environment */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Service Status
                        </label>
                        <select
                          value={form.is_active ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [whatsapp.id]: { ...form, is_active: e.target.value === "active" },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="active">Active (Cloud API Live)</option>
                          <option value="inactive">Disabled (Fallback to wa.me)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Environment
                        </label>
                        <select
                          value={form.environment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [whatsapp.id]: {
                                ...form,
                                environment: e.target.value as "TEST" | "LIVE",
                              },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="TEST">TEST (Sandbox / Simulated)</option>
                          <option value="LIVE">LIVE (Meta Graph API)</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone Number ID & WABA ID */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Phone Number ID
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 106598712345678"
                          value={form.phone_number_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [whatsapp.id]: { ...form, phone_number_id: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                        />
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          WhatsApp &rarr; API Setup
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          WhatsApp Account ID (WABA)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 109876543212345"
                          value={form.waba_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [whatsapp.id]: { ...form, waba_id: e.target.value },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                        />
                        <span className="text-[10px] text-stone-400 mt-0.5 block">
                          Business Manager ID
                        </span>
                      </div>
                    </div>

                    {/* Permanent Access Token */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Permanent System User Access Token
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              [whatsapp.id]: { ...form, showKey: !form.showKey },
                            })
                          }
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        >
                          {form.showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          {form.showKey ? "Hide Token" : "Reveal Token"}
                        </button>
                      </div>
                      <input
                        type={form.showKey ? "text" : "password"}
                        placeholder={whatsapp.credentials?.access_token ? "••••••••••••••••" : "EAAG..."}
                        value={form.access_token}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [whatsapp.id]: { ...form, access_token: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Requires <code className="text-emerald-700 font-mono">whatsapp_business_messaging</code> &amp;{" "}
                        <code className="text-emerald-700 font-mono">whatsapp_business_management</code> scopes.
                      </span>
                    </div>
                  </div>

                  {/* Display Phone, Webhook Verify Token & Template Name */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Display Sender Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={form.display_phone_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [whatsapp.id]: { ...form, display_phone_number: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        The registered verified sender number presented to wedding guests.
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Webhook Verify Secret Token
                      </label>
                      <input
                        type="text"
                        placeholder="balcony_whatsapp_webhook_secret_2026"
                        value={form.webhook_verify_token}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [whatsapp.id]: { ...form, webhook_verify_token: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Paste this exact string into Meta Webhook Verification challenge settings.
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Approved Template Name (Default)
                      </label>
                      <input
                        type="text"
                        placeholder="wedding_invitation_v1"
                        value={form.default_template_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [whatsapp.id]: { ...form, default_template_name: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Pre-approved Meta Message Template used for initial guest invitations.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Webhook Configuration Box */}
                <div className="rounded-2xl border border-emerald-200 bg-white p-4.5 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-stone-900">
                        Meta Inbound Delivery Webhook Endpoint
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={copyWebhookToClipboard}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 cursor-pointer"
                    >
                      {copiedWebhook ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Webhook URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl bg-stone-100 p-2.5 font-mono text-xs text-stone-800 break-all select-all">
                    {webhookUrl || "http://localhost:3000/api/webhooks/whatsapp"}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Set this Callback URL in Meta App Dashboard &rarr; <strong>WhatsApp &rarr; Configuration &rarr; Webhook</strong>. Subscribe to the <code className="font-mono text-emerald-700 font-bold">messages</code> event to record real-time delivery receipts (Sent, Delivered, Read, Failed) and track guest opens.
                  </p>
                </div>

                {/* Test WhatsApp Message Dispatcher */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-emerald-700" />
                    <span className="text-xs font-bold text-stone-900">Send Live WhatsApp Verification Test</span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.test_recipient_phone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [whatsapp.id]: { ...form, test_recipient_phone: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleTestIntegration(whatsapp, {
                          recipient_phone: form.test_recipient_phone || form.display_phone_number,
                        })
                      }
                      disabled={testingId === whatsapp.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-900 cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      <Send className={`h-3.5 w-3.5 ${testingId === whatsapp.id ? "animate-spin" : ""}`} />
                      Send Test WhatsApp Message
                    </button>
                  </div>
                </div>

                {/* Test feedback banner */}
                {testResult && testResult.id === whatsapp.id && (
                  <div
                    className={`rounded-2xl p-4 text-xs flex items-start gap-2.5 ${
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
                    <div>
                      <p className="font-bold">{testResult.ok ? "Verification Passed" : "Verification Failed"}</p>
                      <p className="mt-0.5">{testResult.msg}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    {whatsapp.last_tested_at ? (
                      <span>
                        Last tested: {new Date(whatsapp.last_tested_at).toLocaleString()} (
                        {whatsapp.test_status})
                      </span>
                    ) : (
                      <span>Not tested yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSaveIntegration(whatsapp)}
                      disabled={savingId === whatsapp.id}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingId === whatsapp.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      Save WhatsApp Credentials
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* 2. BREVO TRANSACTIONAL EMAIL MANAGEMENT CARD */}
      {brevo && (
        <section className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/60 via-white to-purple-50/30 p-6 sm:p-8 shadow-sm">
          {(() => {
            const form = formData[brevo.id] || {
              api_key: "",
              sender_email: "",
              sender_name: "",
              environment: "TEST",
              is_active: false,
              showKey: false,
            };

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-violet-100 pb-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-xs">
                      <Mail className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-stone-900">
                          Brevo Email Service (Sendinblue)
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            form.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {form.is_active ? "Active" : "Inactive"}
                        </span>
                        {brevo.test_status && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              brevo.test_status === "PASS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            SMTP: {brevo.test_status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Powers transactional RSVP receipts, host updates, password resets, and reminder broadcasts.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://app.brevo.com/settings/keys/api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 hover:text-violet-800"
                  >
                    <span>Get Brevo API Key</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Form Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Status & Environment */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Service Status
                        </label>
                        <select
                          value={form.is_active ? "active" : "inactive"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [brevo.id]: { ...form, is_active: e.target.value === "active" },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="active">Active (Sending Emails)</option>
                          <option value="inactive">Disabled</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                          Environment
                        </label>
                        <select
                          value={form.environment}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [brevo.id]: {
                                ...form,
                                environment: e.target.value as "TEST" | "LIVE",
                              },
                            })
                          }
                          className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-800 cursor-pointer"
                        >
                          <option value="TEST">TEST (Sandbox)</option>
                          <option value="LIVE">LIVE (Production)</option>
                        </select>
                      </div>
                    </div>

                    {/* API Key */}
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                          Brevo v3 API Key
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              [brevo.id]: { ...form, showKey: !form.showKey },
                            })
                          }
                          className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                        >
                          {form.showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          <span>{form.showKey ? "Hide" : "Show"}</span>
                        </button>
                      </div>
                      <input
                        type={form.showKey ? "text" : "password"}
                        placeholder={brevo.credentials?.api_key ? "••••••••••••••••" : "xkeysib-..."}
                        value={form.api_key}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [brevo.id]: { ...form, api_key: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                      />
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Verified Sender Email
                      </label>
                      <input
                        type="email"
                        placeholder="invites@yourdomain.com"
                        value={form.sender_email}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [brevo.id]: { ...form, sender_email: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        Must match an authenticated sender or domain verified in your Brevo account.
                      </span>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Sender Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="Balcony Digital Invites"
                        value={form.sender_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [brevo.id]: { ...form, sender_name: e.target.value },
                          })
                        }
                        className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Test feedback banner */}
                {testResult && testResult.id === brevo.id && (
                  <div
                    className={`rounded-2xl p-4 text-xs flex items-start gap-2.5 ${
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

                {/* Actions */}
                <div className="pt-4 border-t border-violet-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    {brevo.last_tested_at ? (
                      <span>
                        Last tested: {new Date(brevo.last_tested_at).toLocaleString()} (
                        {brevo.test_status})
                      </span>
                    ) : (
                      <span>Not tested yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleTestIntegration(brevo)}
                      disabled={testingId === brevo.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Send className={`h-3.5 w-3.5 ${testingId === brevo.id ? "animate-spin" : ""}`} />
                      Send Verification Email
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveIntegration(brevo)}
                      disabled={savingId === brevo.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingId === brevo.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      Save Brevo Credentials
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* 3. SUPABASE CLOUD DATABASE & STORAGE MANAGEMENT CARD */}
      {supabase && (
        <section className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50/50 via-white to-emerald-50/30 p-6 sm:p-8 shadow-sm">
          {(() => {
            const form = formData[supabase.id] || {
              project_url: "",
              anon_key: "",
              service_role_key: "",
              environment: "LIVE",
              is_active: true,
              showKey: false,
            };

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-teal-100 pb-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xs shrink-0">
                      <Database className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-stone-900">
                          Supabase Cloud Database &amp; Global Storage
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            form.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {form.is_active ? "Active" : "Inactive"}
                        </span>
                        {supabase.test_status && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              supabase.test_status === "PASS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            Storage: {supabase.test_status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Powers PostgreSQL replication, Guest Photo Wall CDN storage, and Creator Media Elements bucket.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://supabase.com/dashboard/project/_/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                  >
                    <span>Supabase API Keys</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Active Storage Buckets Pill Summary */}
                <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                    <Cloud className="h-4 w-4 text-teal-700" />
                    <span>Configured Global CDN Storage Buckets</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white border border-teal-200 px-3 py-1 font-mono text-teal-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      bucket: <strong>photos</strong> (Guest Wishes)
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white border border-teal-200 px-3 py-1 font-mono text-teal-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      bucket: <strong>guest-wishes</strong> (Direct Uploads)
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-xl bg-white border border-teal-200 px-3 py-1 font-mono text-teal-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      bucket: <strong>elements</strong> (Creator Media: SVG, MP4, MP3, etc.)
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Status Toggle & Environment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                      <div>
                        <span className="text-xs font-semibold text-stone-900 block">Supabase Service Status</span>
                        <span className="text-[11px] text-stone-500">Enable cloud sync for guest media</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [supabase.id]: { ...form, is_active: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                      <div>
                        <span className="text-xs font-semibold text-stone-900 block">Environment Target</span>
                        <span className="text-[11px] text-stone-500">Live Production or Local Staging</span>
                      </div>
                      <select
                        value={form.environment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [supabase.id]: {
                              ...form,
                              environment: e.target.value as "TEST" | "LIVE",
                            },
                          })
                        }
                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 cursor-pointer"
                      >
                        <option value="LIVE">Live Production</option>
                        <option value="TEST">Local / Test</option>
                      </select>
                    </div>
                  </div>

                  {/* Project URL */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Supabase Project URL (NEXT_PUBLIC_SUPABASE_URL)
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={form.project_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [supabase.id]: { ...form, project_url: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Found under Supabase Settings &rarr; API &rarr; Project URL.
                    </span>
                  </div>

                  {/* Anon Key */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Supabase Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type={form.showKey ? "text" : "password"}
                      placeholder="eyJh..."
                      value={form.anon_key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [supabase.id]: { ...form, anon_key: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Client-side public key safe for browser sessions and real-time wish listeners.
                    </span>
                  </div>

                  {/* Service Role Secret Key */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Supabase Service Role Key (SUPABASE_SERVICE_ROLE_KEY)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            [supabase.id]: { ...form, showKey: !form.showKey },
                          })
                        }
                        className="text-[11px] font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                      >
                        {form.showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {form.showKey ? "Hide Keys" : "Reveal Keys"}
                      </button>
                    </div>
                    <input
                      type={form.showKey ? "text" : "password"}
                      placeholder="eyJh..."
                      value={form.service_role_key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [supabase.id]: { ...form, service_role_key: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Secret privileged server key. Encrypted with AES-256 in database. Used for storage bucket administration and signed URLs.
                    </span>
                  </div>
                </div>

                {/* Test feedback banner */}
                {testResult && testResult.id === supabase.id && (
                  <div
                    className={`rounded-2xl p-4 text-xs flex items-start gap-2.5 ${
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
                    <div>
                      <p className="font-bold">{testResult.ok ? "Verification Passed" : "Verification Failed"}</p>
                      <p className="mt-0.5">{testResult.msg}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    {supabase.last_tested_at ? (
                      <span>
                        Last tested: {new Date(supabase.last_tested_at).toLocaleString()} (
                        {supabase.test_status})
                      </span>
                    ) : (
                      <span>Not tested yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleTestIntegration(supabase)}
                      disabled={testingId === supabase.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Cloud className={`h-3.5 w-3.5 ${testingId === supabase.id ? "animate-spin" : ""}`} />
                      Test Supabase Connection
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveIntegration(supabase)}
                      disabled={savingId === supabase.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingId === supabase.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      Save Supabase Credentials
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* 4. GOOGLE MAPS PLATFORM MANAGEMENT CARD */}
      {googleMaps && (
        <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30 p-6 sm:p-8 shadow-sm">
          {(() => {
            const form = formData[googleMaps.id] || {
              api_key: "",
              enable_places: true,
              enable_geocoding: true,
              environment: "TEST",
              is_active: false,
              showKey: false,
            };

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-sky-100 pb-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-xs shrink-0">
                      <MapPin className="h-6 w-6" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-serif text-xl font-bold text-stone-900">
                          Google Maps Platform &amp; Places API
                        </h2>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            form.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {form.is_active ? "Active" : "Inactive"}
                        </span>
                        {googleMaps.test_status && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              googleMaps.test_status === "PASS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            Maps API: {googleMaps.test_status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-500">
                        Powers wedding venue autocomplete, GPS directions link generation, and interactive venue map embed cards for guests.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://console.cloud.google.com/google/maps-apis"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    <span>Google Cloud Console</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  {/* Status Toggle & Environment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                      <div>
                        <span className="text-xs font-semibold text-stone-900 block">Google Maps Integration</span>
                        <span className="text-[11px] text-stone-500">Enable venue geocoding and live maps</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.is_active}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [googleMaps.id]: { ...form, is_active: e.target.checked },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/60 p-3.5">
                      <div>
                        <span className="text-xs font-semibold text-stone-900 block">API Environment</span>
                        <span className="text-[11px] text-stone-500">Test Mock or Live Google Maps</span>
                      </div>
                      <select
                        value={form.environment}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [googleMaps.id]: {
                              ...form,
                              environment: e.target.value as "TEST" | "LIVE",
                            },
                          })
                        }
                        className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 cursor-pointer"
                      >
                        <option value="LIVE">Live Google Cloud</option>
                        <option value="TEST">Local / Test Sandbox</option>
                      </select>
                    </div>
                  </div>

                  {/* API Key */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                        Google Maps JavaScript &amp; Geocoding API Key (NEXT_PUBLIC_GOOGLE_MAPS_KEY)
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            [googleMaps.id]: { ...form, showKey: !form.showKey },
                          })
                        }
                        className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                      >
                        {form.showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {form.showKey ? "Hide Key" : "Reveal Key"}
                      </button>
                    </div>
                    <input
                      type={form.showKey ? "text" : "password"}
                      placeholder={googleMaps.credentials?.api_key ? "••••••••••••••••" : "AIzaSy..."}
                      value={form.api_key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [googleMaps.id]: { ...form, api_key: e.target.value },
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Restricted API key with <code className="text-sky-700 font-mono">Maps JavaScript API</code>,{" "}
                      <code className="text-sky-700 font-mono">Places API</code>, and{" "}
                      <code className="text-sky-700 font-mono">Geocoding API</code> enabled.
                    </span>
                  </div>

                  {/* Feature toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.enable_places ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [googleMaps.id]: { ...form, enable_places: e.target.checked },
                          })
                        }
                        className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-800 block">Places Autocomplete</span>
                        <span className="text-[10px] text-stone-500">Auto-suggest venue addresses in invitation editor</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.enable_geocoding ?? true}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [googleMaps.id]: { ...form, enable_geocoding: e.target.checked },
                          })
                        }
                        className="rounded text-sky-600 focus:ring-sky-500 h-4 w-4"
                      />
                      <div>
                        <span className="text-xs font-semibold text-stone-800 block">Geocoding &amp; Directions</span>
                        <span className="text-[10px] text-stone-500">Generate Google Maps / Apple Maps navigation pins</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Test feedback banner */}
                {testResult && testResult.id === googleMaps.id && (
                  <div
                    className={`rounded-2xl p-4 text-xs flex items-start gap-2.5 ${
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
                    <div>
                      <p className="font-bold">{testResult.ok ? "Verification Passed" : "Verification Failed"}</p>
                      <p className="mt-0.5">{testResult.msg}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-stone-500">
                    {googleMaps.last_tested_at ? (
                      <span>
                        Last tested: {new Date(googleMaps.last_tested_at).toLocaleString()} (
                        {googleMaps.test_status})
                      </span>
                    ) : (
                      <span>Not tested yet</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleTestIntegration(googleMaps, { api_key: form.api_key })}
                      disabled={testingId === googleMaps.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <MapPin className={`h-3.5 w-3.5 ${testingId === googleMaps.id ? "animate-spin" : ""}`} />
                      Verify Maps API Key
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveIntegration(googleMaps)}
                      disabled={savingId === googleMaps.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingId === googleMaps.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      Save Google Maps Credentials
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* 5. ANY OTHER DETECTED SERVICES */}
      {otherIntegrations.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="font-serif text-lg font-bold text-stone-900">Additional Registered Services</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherIntegrations.map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Layers className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">{i.display_name}</h4>
                    <p className="text-[11px] text-stone-500">Service: {i.service_slug}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      i.is_active ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {i.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

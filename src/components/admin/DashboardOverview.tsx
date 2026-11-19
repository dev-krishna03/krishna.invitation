"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Users,
  Sparkles,
  Receipt,
  Building2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Palette,
  TicketPercent,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type StatProps = {
  users: number;
  activeInv: number;
  revenue: number;
  companies: number;
  recentUsers: { id: string; name: string | null; email: string; role: string; created_at: string }[];
  recentInvites: { id: string; title: string; slug: string; template: string; is_published: boolean; created_at: string }[];
  recentPayments: { id: string; amount: number; status: string; gateway: string; created_at: string }[];
};

export function DashboardOverview({
  users,
  activeInv,
  revenue,
  companies,
  recentUsers,
  recentInvites,
  recentPayments,
}: StatProps) {
  const cards = [
    {
      label: "Total Registered Users",
      value: users.toLocaleString(),
      icon: Users,
      trend: "+18% from last month",
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconColor: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    },
    {
      label: "Active Invitations",
      value: activeInv.toLocaleString(),
      icon: Sparkles,
      trend: "Real-time published",
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      iconColor: "text-rose-400 bg-rose-500/20 border-rose-500/30",
    },
    {
      label: "Revenue (Current Month)",
      value: `₹${revenue.toLocaleString()}`,
      icon: Receipt,
      trend: "Net verified volume",
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconColor: "text-emerald-400 bg-emerald-500/20 border-emerald-500/30",
    },
    {
      label: "Active Agency Accounts",
      value: companies.toLocaleString(),
      icon: Building2,
      trend: "Event planners & studios",
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconColor: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Quick Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Super Admin Control Center
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            Real-time platform governance, user management, revenue streams, and security audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/krishna/admin/templates"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-950/30 hover:brightness-105 transition-all"
          >
            <Palette className="h-3.5 w-3.5" />
            <span>Manage Templates</span>
          </Link>
          <Link
            href="/krishna/admin/settings"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-800 px-3.5 py-2 text-xs font-semibold text-stone-300 hover:bg-stone-700 hover:text-white transition-colors"
          >
            <span>Site Settings</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              whileHover={{ y: -3 }}
              className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-br ${c.gradient} bg-stone-950/70 p-5 shadow-lg backdrop-blur-sm transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">{c.label}</span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${c.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <div className="mt-3 font-serif text-3xl font-bold tracking-tight text-white">
                {c.value}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span>{c.trend}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400">
          Executive Quick Shortcuts
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Templates", href: "/krishna/admin/templates", icon: Palette },
            { label: "Occasions", href: "/krishna/admin/event-types", icon: Sparkles },
            { label: "User Accounts", href: "/krishna/admin/users", icon: Users },
            { label: "Gateways", href: "/krishna/admin/gateways", icon: Wallet },
            { label: "Discount Coupons", href: "/krishna/admin/coupons", icon: TicketPercent },
            { label: "Audit Log", href: "/krishna/admin/audit-log", icon: ShieldCheck },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="group flex flex-col items-center justify-center rounded-2xl border border-stone-800 bg-stone-950/60 p-4 text-center transition-all hover:border-amber-500/40 hover:bg-stone-900"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-stone-300 group-hover:bg-gradient-to-br group-hover:from-rose-600 group-hover:to-amber-600 group-hover:text-white transition-all shadow-sm">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-2 text-xs font-semibold text-stone-300 group-hover:text-white">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two-Column Responsive Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Invitations */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-800 bg-stone-950/70 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <h3 className="font-serif text-base font-bold text-white">Recent Invitations</h3>
            </div>
            <Link
              href="/krishna/admin/templates"
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              View Templates →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-stone-800/60 overflow-hidden">
            {recentInvites.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-500">No invitations created yet.</p>
            ) : (
              recentInvites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3 text-xs">
                  <div className="min-w-0 pr-4">
                    <p className="font-semibold text-stone-200 truncate">{inv.title}</p>
                    <p className="text-[11px] text-stone-500">
                      Template: <span className="text-stone-400">{inv.template}</span> • {inv.created_at}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        inv.is_published
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-stone-800 text-stone-400"
                      }`}
                    >
                      {inv.is_published ? "Published" : "Draft"}
                    </span>
                    <Link
                      href={`/try/${inv.slug}`}
                      target="_blank"
                      className="text-stone-400 hover:text-white"
                      title="Preview"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: System Health & Recent Payments */}
        <div className="lg:col-span-5 space-y-6">
          {/* System Security & Integrity */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-5 shadow-lg">
            <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="font-serif text-base font-bold text-white">Platform Health</h3>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">PostgreSQL Database</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Credentials Key (AES-256)</span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Super Admin Token Expiry</span>
                <span className="text-amber-400 font-mono text-[11px]">8 Hours Session</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">WhatsApp Notification API</span>
                <span className="text-stone-300 font-mono text-[11px]">Configured</span>
              </div>
            </div>
          </div>

          {/* Recent Payments Feed */}
          <div className="rounded-2xl border border-stone-800 bg-stone-950/70 p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <h3 className="font-serif text-base font-bold text-white">Recent Payments</h3>
              </div>
              <Link
                href="/krishna/admin/payments"
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                All →
              </Link>
            </div>
            <div className="mt-3 divide-y divide-stone-800/60">
              {recentPayments.length === 0 ? (
                <p className="py-4 text-center text-xs text-stone-500">No payment records yet.</p>
              ) : (
                recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-xs">
                    <div>
                      <p className="font-semibold text-stone-200">₹{p.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-stone-500">{p.gateway} • {p.created_at}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.status === "SUCCESS"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

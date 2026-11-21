"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  Users,
  Building2,
  CreditCard,
  Wallet,
  Boxes,
  TicketPercent,
  Receipt,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  Shield,
  Activity,
  Layers,
  ShieldCheck,
  Crown,
  Scale,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/krishna/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/krishna/admin/templates", label: "Templates", icon: Palette },
  { href: "/krishna/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { href: "/krishna/admin/elements", label: "Editor Elements", icon: Layers },
  { href: "/krishna/admin/event-types", label: "Occasions", icon: Sparkles },
  { href: "/krishna/admin/users", label: "Users", icon: Users },
  { href: "/krishna/admin/organizations", label: "Companies", icon: Building2 },
  { href: "/krishna/admin/plans", label: "Subscription Plans", icon: CreditCard },
  { href: "/krishna/admin/creator-plans", label: "Creator Plans", icon: Crown },
  { href: "/krishna/admin/policies", label: "Policies", icon: Scale },
  { href: "/krishna/admin/gateways", label: "Payment Gateways", icon: Wallet },
  { href: "/krishna/admin/integrations", label: "Integrations", icon: Boxes },
  { href: "/krishna/admin/coupons", label: "Coupons", icon: TicketPercent },
  { href: "/krishna/admin/payments", label: "Payments", icon: Receipt },
  { href: "/krishna/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/krishna/admin/audit-log", label: "Audit Log", icon: ShieldAlert },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock admin session
  async function handleLock() {
    setLoggingOut(true);
    await fetch("/api/krishna", { method: "DELETE" }).catch(() => {});
    router.push("/krishna");
  }

  // Find active item
  const currentNav =
    NAV_ITEMS.find((n) => n.href === pathname) ??
    NAV_ITEMS.find((n) => n.href !== "/krishna/admin" && pathname.startsWith(n.href)) ??
    NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Desktop Sticky & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-stone-200 bg-white p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-5">
            <Link href="/krishna/admin" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/20">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
                  Krishna Super Admin
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-rose-700/80 font-semibold">
                  Root Governance
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/krishna/admin"
                  ? pathname === "/krishna/admin"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-rose-50 to-amber-50 text-rose-800 border border-rose-200 shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-rose-600 text-white shadow-sm shadow-rose-900/20"
                          : "text-stone-500 group-hover:text-stone-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="h-1.5 w-1.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.5)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & Lock button */}
        <div className="border-t border-stone-200 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-stone-50 p-3 border border-stone-200">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-stone-900">Super Admin</span>
                <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Authenticated
                </span>
              </div>
            </div>

            <button
              onClick={handleLock}
              disabled={loggingOut}
              title="Lock Admin Session"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="hidden sm:inline">Super Admin</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-stone-400" />
              <span className="text-sm font-semibold text-stone-900">{currentNav.label}</span>
            </div>
          </div>

          {/* Quick Actions & Live Link */}
          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Open Public Site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <span className="hidden sm:inline">View Public Web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Lock button on header */}
            <button
              onClick={handleLock}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </header>

        {/* Child Page Wrapper */}
        <main className="flex-1 bg-stone-50 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

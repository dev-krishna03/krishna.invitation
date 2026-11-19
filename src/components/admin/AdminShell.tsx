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
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/krishna/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/krishna/admin/templates", label: "Templates", icon: Palette },
  { href: "/krishna/admin/event-types", label: "Occasions", icon: Sparkles },
  { href: "/krishna/admin/users", label: "Users", icon: Users },
  { href: "/krishna/admin/organizations", label: "Companies", icon: Building2 },
  { href: "/krishna/admin/plans", label: "Plans", icon: CreditCard },
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
    <div className="flex min-h-screen bg-stone-900 text-stone-100 font-sans">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Desktop Sticky & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between border-r border-stone-800 bg-stone-950 p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-stone-800/80 pb-5">
            <Link href="/krishna/admin" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/40">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  Krishna Super Admin
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400/90 font-semibold">
                  Root Governance
                </span>
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white"
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
                      ? "bg-gradient-to-r from-rose-600/20 to-amber-500/10 text-white border border-rose-500/30 shadow-sm"
                      : "text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-rose-600 text-white shadow-sm shadow-rose-900/30"
                          : "text-stone-400 group-hover:text-stone-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & Lock button */}
        <div className="border-t border-stone-800/80 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-stone-900/80 p-3 border border-stone-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-stone-200">Super Admin</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Authenticated
                </span>
              </div>
            </div>

            <button
              onClick={handleLock}
              disabled={loggingOut}
              title="Lock Admin Session"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-800 bg-stone-950/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 text-stone-300 hover:bg-stone-900"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
              <span className="hidden sm:inline">Super Admin</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-stone-600" />
              <span className="text-sm font-semibold text-white">{currentNav.label}</span>
            </div>
          </div>

          {/* Quick Actions & Live Link */}
          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Live</span>
            </div>

            {/* Open Public Site */}
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <span className="hidden sm:inline">View Public Web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            {/* Lock button on header */}
            <button
              onClick={handleLock}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-lg border border-rose-900/40 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </header>

        {/* Child Page Wrapper */}
        <main className="flex-1 bg-stone-900/60 p-4 sm:p-6 lg:p-8">
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

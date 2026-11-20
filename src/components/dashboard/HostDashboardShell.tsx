"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  PlusCircle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  User,
  Home,
  CheckCircle,
  Compass,
  Library,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Invitations", icon: Sparkles },
  { href: "/dashboard/create", label: "Create Invitation", icon: PlusCircle },
  { href: "/community", label: "Explore Community", icon: Compass },
  { href: "/dashboard/library", label: "My Library", icon: Library },
  { href: "/dashboard/analytics", label: "Guest Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Account Settings", icon: Settings },
];

export function HostDashboardShell({
  userEmail,
  children,
}: {
  userEmail?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const currentNav =
    NAV_ITEMS.find((n) => n.href === pathname) ??
    NAV_ITEMS.find((n) => n.href !== "/dashboard" && pathname.startsWith(n.href)) ??
    NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-[#FAF8F5] text-stone-900 font-sans selection:bg-rose-200 selection:text-rose-900">
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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-stone-200/80 bg-white p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-5">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/15">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-bold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
                  Krishna<span className="text-rose-600">.</span>invitation
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500">
                  Host Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-rose-50 text-rose-800 border border-rose-200/70 shadow-sm"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isActive ? "bg-rose-600 text-white shadow-sm" : "text-stone-400 group-hover:text-stone-700"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.span
                      layoutId="hostActivePill"
                      className="h-1.5 w-1.5 rounded-full bg-rose-600"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick link to Gallery */}
          <div className="mt-6 pt-4 border-t border-stone-100">
            <Link
              href="/gallery"
              className="flex items-center justify-between rounded-xl bg-amber-50/70 p-3 border border-amber-200/60 text-xs font-semibold text-amber-900 hover:bg-amber-100/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Browse Design Gallery</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-amber-700" />
            </Link>
          </div>
        </div>

        {/* Footer profile & Sign out */}
        <div className="border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5 border border-stone-200/60">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-200 to-amber-200 text-rose-800 font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-stone-800 truncate">
                  {userEmail ?? "Host Account"}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active Host
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={loggingOut}
              title="Sign Out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/80 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
              <span className="hidden sm:inline">Portal</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-stone-300" />
              <span className="text-sm font-semibold text-stone-900">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              <span>View Public Web</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <Link
              href="/dashboard/create"
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-900/15 hover:brightness-105 transition-all"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Create Invitation</span>
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

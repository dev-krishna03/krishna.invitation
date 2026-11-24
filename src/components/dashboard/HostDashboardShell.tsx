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
  Palette,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/dashboard/workspace", label: "Workspace", icon: Home },
  { href: "/dashboard", label: "My Invitations", icon: Sparkles },
  { href: "/dashboard/create", label: "Create Invitation", icon: PlusCircle },
  { href: "/dashboard/custom-requests", label: "Request a Design", icon: Palette },
  { href: "/dashboard/templates", label: "My Templates", icon: Library },
  { href: "/dashboard/plan", label: "Plans & Pricing", icon: BarChart3 },
  { href: "/community", label: "Explore Community", icon: Compass },
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
    <div className="flex min-h-screen bg-[#FAF9FD] text-[#12042F] font-sans selection:bg-[#F5F1FE] selection:text-[#6520EE]">
      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-[#12042F]/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar: Desktop Sticky & Mobile Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-[#E5D9FC] bg-white p-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="flex items-center justify-between border-b border-[#F5F1FE] pb-5">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#6520EE] text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                  krishna<span className="text-[#6520EE]">.</span>invites
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#7A7387]">
                  Host Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-[#F5F1FE]"
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
                  className={`group relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] shadow-xs"
                      : "text-[#5B556B] hover:bg-[#FAF9FD] hover:text-[#12042F]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                        isActive ? "bg-[#6520EE] text-white shadow-sm" : "text-[#7A7387] group-hover:text-[#12042F]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isActive && (
                    <motion.span
                      layoutId="hostActivePill"
                      className="h-1.5 w-1.5 rounded-full bg-[#6520EE]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick link to Gallery */}
          <div className="mt-6 pt-4 border-t border-[#F5F1FE]">
            <Link
              href="/gallery"
              className="flex items-center justify-between rounded-2xl bg-[#F5F1FE] p-3 border border-[#E5D9FC] text-xs font-semibold text-[#6520EE] hover:bg-[#EDE8F5] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#6520EE]" />
                <span>Browse Design Gallery</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-[#6520EE]" />
            </Link>
          </div>
        </div>

        {/* Footer profile & Sign out */}
        <div className="border-t border-[#F5F1FE] pt-4">
          <div className="flex items-center justify-between rounded-2xl bg-[#FAF9FD] p-2.5 border border-[#E5D9FC]">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE8F5] text-[#6520EE] font-bold text-xs">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#12042F] truncate">
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-[#F5F1FE] hover:text-[#6520EE] transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#E5D9FC] bg-white/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5D9FC] text-[#12042F] hover:bg-[#F5F1FE]"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-[#7A7387]">
              <span className="hidden sm:inline">Portal</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-[#E5D9FC]" />
              <span className="text-sm font-semibold text-[#12042F]">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#5B556B] hover:text-[#12042F]"
            >
              <span>View Public Web</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <Link
              href="/dashboard/create"
              className="flex items-center gap-1.5 rounded-full bg-[#6520EE] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#5213D2] transition-all"
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

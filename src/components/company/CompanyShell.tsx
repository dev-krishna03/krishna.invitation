"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  LayoutDashboard,
  Palette,
  Sparkles,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/company", label: "Agency Overview", icon: LayoutDashboard },
  { href: "/company/editor", label: "Canva Invitation Studio", icon: Palette, badge: "Canva Editor" },
  { href: "/company/invitations", label: "Client Invitations", icon: FolderKanban },
  { href: "/company/team", label: "Team Members", icon: Users },
  { href: "/company/subscription", label: "Subscription Plan", icon: CreditCard },
  { href: "/company/settings", label: "Agency Settings", icon: Settings },
];

export function CompanyShell({
  orgName = "Krishna Event Studio",
  children,
}: {
  orgName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  // If in the Canva Editor, render full-screen without the outer company shell to avoid double headers
  if (pathname === "/company/editor") {
    return <div className="h-screen w-screen overflow-hidden bg-white">{children}</div>;
  }

  const currentNav =
    NAV_ITEMS.find((n) => n.href === pathname) ??
    NAV_ITEMS.find((n) => n.href !== "/company" && pathname.startsWith(n.href)) ??
    NAV_ITEMS[0];

  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-rose-500 selection:text-white">
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
            <Link href="/company" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-indigo-600 to-rose-600 text-white shadow-lg shadow-purple-950/40">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors truncate">
                  {orgName}
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase text-purple-400 font-semibold">
                  Agency Studio
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Canva CTA button */}
          <div className="mt-5">
            <Link
              href="/company/editor"
              className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 p-2.5 text-xs font-bold text-white shadow-lg shadow-purple-950/30 hover:brightness-105 transition-all"
            >
              <Palette className="h-4 w-4" />
              <span>Open Canva Studio</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/company"
                  ? pathname === "/company"
                  : pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-indigo-500/10 text-white border border-purple-500/30 shadow-sm"
                      : "text-stone-400 hover:bg-stone-900 hover:text-stone-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-600 text-white shadow-sm shadow-purple-900/30"
                          : "text-stone-400 group-hover:text-stone-200"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & Sign Out */}
        <div className="border-t border-stone-800/80 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-stone-900/80 p-3 border border-stone-800">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30">
                AP
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-stone-200 truncate">Agency Pro</span>
                <span className="text-[10px] text-purple-400 font-mono">Unlimited Templates</span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
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
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-stone-800 text-stone-300 hover:bg-stone-900"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
              <span className="hidden sm:inline">Agency Studio</span>
              <ChevronRight className="h-3.5 w-3.5 hidden sm:inline text-stone-600" />
              <span className="text-sm font-semibold text-white">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-stone-300 hover:bg-stone-800 hover:text-white transition-colors"
            >
              <span>View Public Web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/company/editor"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-purple-950/40 hover:brightness-105 transition-all"
            >
              <Palette className="h-3.5 w-3.5" />
              <span>Launch Canva Editor</span>
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

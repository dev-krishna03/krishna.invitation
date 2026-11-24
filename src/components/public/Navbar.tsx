"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";

const NAV_LINKS = [
  { href: "/gallery", label: "Templates" },
  { href: "/#features", label: "Features" },
  { href: "/#sharing", label: "Sharing" },
  { href: "/pricing", label: "Pricing" },
  { href: "/affiliates", label: "Affiliates" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 sm:px-8 transition-transform duration-300">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 rounded-full border border-[#E5D9FC] bg-white/95 p-2 px-6 shadow-sm shadow-[#6520EE]/5 backdrop-blur-md">
        {/* Brand Logo - Balcony minimalist elegance */}
        <Link href="/" className="group flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6520EE] text-white shadow-sm shadow-[#6520EE]/30 transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-sans text-lg font-bold tracking-tight text-[#12042F]">
              krishna<span className="text-[#6520EE]">.</span>invites
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Sections">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 no-underline ${
                  isActive
                    ? "bg-[#F5F1FE] text-[#6520EE] font-bold"
                    : "text-stone-600 hover:text-[#12042F] hover:bg-[#F5F1FE]/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-1.5 text-xs font-semibold text-stone-700 hover:text-[#12042F] hover:bg-stone-50 transition-colors no-underline"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#6520EE] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#6520EE]/20 hover:bg-[#5213D2] transition-all no-underline"
            >
              <span>View templates</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="sm:hidden flex h-9 w-9 items-center justify-center rounded-full text-stone-700 hover:bg-[#F5F1FE] transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden mx-auto mt-2 max-w-[1120px] rounded-3xl border border-[#E5D9FC] bg-white p-5 shadow-xl shadow-[#6520EE]/10 flex flex-col gap-2"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-stone-800 hover:bg-[#F5F1FE] hover:text-[#6520EE] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-3 border-t border-stone-100 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full text-center rounded-full border border-stone-200 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
              >
                Sign in
              </Link>
              <Link
                href="/gallery"
                className="w-full text-center rounded-full bg-[#6520EE] py-2.5 text-xs font-bold text-white shadow-md shadow-[#6520EE]/25 hover:bg-[#5213D2]"
              >
                View templates
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Menu, X, ArrowRight, Heart, Compass, ShieldCheck } from "lucide-react";

const NAV_LINKS = [
  { href: "/gallery", label: "Designs" },
  { href: "/#occasions", label: "Occasions" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#FAF8F5]/90 backdrop-blur-md shadow-sm border-b border-stone-200/70 py-3"
          : "bg-[#FAF8F5]/70 backdrop-blur-sm py-4 border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/15"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 group-hover:text-rose-700 transition-colors">
              Krishna<span className="text-rose-600">.</span>invitation
            </span>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-500">
              Luxury Studio
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-100/70 p-1.5 rounded-full border border-stone-200/60 shadow-inner">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "text-rose-700 bg-white shadow-sm font-semibold"
                    : "text-stone-600 hover:text-stone-950 hover:bg-white/60"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-900/20 hover:shadow-rose-700/30 transition-all hover:brightness-105"
            >
              <span>Create Invite</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-100"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-b border-stone-200/80 bg-[#FAF8F5]/98 px-6 py-6 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-stone-800 hover:bg-stone-100/80"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col gap-2.5">
                <Link
                  href="/login"
                  className="w-full text-center rounded-lg border border-stone-300 py-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/gallery"
                  className="w-full text-center rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-900/20"
                >
                  Explore Designs & Create
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

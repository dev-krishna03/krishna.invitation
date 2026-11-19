"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#FAF8F5] text-stone-900 selection:bg-rose-200 selection:text-rose-900 overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200/50 via-rose-200/40 to-transparent blur-3xl opacity-75" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-gradient-to-tl from-amber-300/20 to-transparent blur-3xl" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between">
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

        <Link
          href="/"
          className="text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Centered Card */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="rounded-3xl border border-stone-200/90 bg-white/95 p-6 sm:p-9 shadow-2xl shadow-rose-950/10 backdrop-blur-xl"
        >
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 text-rose-700 border border-rose-100 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-stone-900">
              {title}
            </h1>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">{subtitle}</p>
          </div>

          <div className="mt-6">{children}</div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-stone-400">
        <div className="flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" />
            <span>Honoring Celebrations</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

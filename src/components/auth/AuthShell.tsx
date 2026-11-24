"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ShieldCheck } from "lucide-react";

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
    <div className="relative min-h-screen flex flex-col justify-between bg-white text-[#12042F] selection:bg-[#F5F1FE] selection:text-[#6520EE] overflow-hidden">
      {/* Soft Balcony dusk background ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[550px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#F5F1FE] via-[#EDE4FD]/30 to-transparent blur-3xl opacity-80" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto w-full max-w-[1120px] px-6 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6520EE] text-white shadow-sm shadow-[#6520EE]/30 transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#12042F]">
            krishna<span className="text-[#6520EE]">.</span>invites
          </span>
        </Link>

        <Link
          href="/"
          className="rounded-full px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-[#12042F] hover:bg-[#F5F1FE] transition-colors no-underline"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Centered Card */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="rounded-3xl border border-[#E5D9FC] bg-white p-7 sm:p-9 shadow-xl shadow-[#6520EE]/10"
        >
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#12042F]">{title}</h1>
            <p className="mt-1.5 text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
              {subtitle}
            </p>
          </div>

          <div className="mt-6">{children}</div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-[1120px] px-6 py-6 text-center text-xs text-stone-400">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>256-Bit SSL Encrypted • Digital Website Invites</span>
        </div>
      </footer>
    </div>
  );
}

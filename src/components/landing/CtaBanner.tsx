"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export function CtaBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#12042F] p-8 sm:p-14 text-white text-center shadow-2xl border border-[#24075F]">
      {/* Decorative ambient lights */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#6520EE]/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-[#BDA0F8]/15 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-[#BDA0F8] border border-white/15">
          <Sparkles className="h-3.5 w-3.5 text-[#BDA0F8]" />
          <span>Balcony Style Digital Invites</span>
        </div>

        <h2 className="mt-5 text-3xl font-bold sm:text-4xl text-white">
          Make your celebration invitation unforgettable.
        </h2>

        <p className="mt-4 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
          Pick a template, choose your validity days, personalize with your story and music,
          and send it directly to your guest list on WhatsApp.
        </p>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-[#6520EE] hover:bg-[#5213D2] px-7 py-3.5 text-xs font-bold text-white shadow-lg shadow-[#6520EE]/35 transition-all no-underline"
            >
              <span>Explore all templates</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-xs font-semibold text-white transition-colors no-underline"
            >
              <span>View pricing plans</span>
            </Link>
          </motion.div>
        </div>

        <p className="mt-6 text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-[#BDA0F8] fill-[#BDA0F8]" />
          <span>Zero paper waste • 100% digital web invite experience</span>
        </p>
      </div>
    </div>
  );
}

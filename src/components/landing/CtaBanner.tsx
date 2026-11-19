"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Heart } from "lucide-react";

export function CtaBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-rose-950 to-stone-900 p-8 sm:p-14 text-white text-center shadow-2xl border border-stone-800">
      {/* Decorative ambient lights */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-2xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 border border-amber-400/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Begin Your Celebration Journey</span>
        </div>

        <h2 className="mt-5 font-serif text-3xl font-bold sm:text-4xl text-white">
          Ready to Craft an Unforgettable Invitation?
        </h2>

        <p className="mt-4 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
          Choose a design, add your story, preview live with music, and share on WhatsApp in minutes.
          Zero design skills required.
        </p>

        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-rose-700 px-7 py-3 text-xs font-bold text-white shadow-lg shadow-rose-900/30 hover:brightness-105 transition-all"
            >
              <span>Explore All Templates</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-stone-600 bg-stone-800/80 px-6 py-3 text-xs font-semibold text-stone-200 hover:bg-stone-700 hover:text-white transition-colors"
            >
              <span>View Pricing</span>
            </Link>
          </motion.div>
        </div>

        <p className="mt-6 text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
          <span>Instant access • 100% money-back satisfaction guarantee</span>
        </p>
      </div>
    </div>
  );
}

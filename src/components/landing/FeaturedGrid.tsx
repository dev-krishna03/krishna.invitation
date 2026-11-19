"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { TiltCard } from "@/components/motion/TiltCard";
import { Sparkles, Eye, ArrowRight, Star } from "lucide-react";

type Item = {
  id: string;
  slug: string;
  name: string;
  from?: { price: number; days: number };
};

export function FeaturedGrid({ items }: { items: Item[] }) {
  return (
    <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => {
        const isRoyal = t.slug.includes("royal");
        return (
          <motion.div key={t.id} variants={staggerItem}>
            <TiltCard>
              <div className="relative overflow-hidden rounded-xl">
                {/* Visual template preview simulation */}
                <div
                  className={`aspect-[4/5] flex flex-col justify-between p-6 transition-transform duration-500 hover:scale-105 ${
                    isRoyal
                      ? "bg-gradient-to-br from-[#4A0E17] via-[#7B1123] to-[#991B1B] text-amber-100"
                      : "bg-gradient-to-br from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] text-stone-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        isRoyal
                          ? "bg-amber-400/20 text-amber-200 border border-amber-300/30"
                          : "bg-stone-900/10 text-stone-700 border border-stone-300/50"
                      }`}
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      {isRoyal ? "Luxury Wedding" : "Modern Minimal"}
                    </span>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full ${
                        isRoyal ? "bg-amber-400/20 text-amber-300" : "bg-white/80 text-stone-700"
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </span>
                  </div>

                  <div className="text-center my-auto py-6">
                    <div className="text-xs uppercase tracking-[0.2em] opacity-80">
                      {isRoyal ? "॥ शुभ विवाह ॥" : "Celebration of Love"}
                    </div>
                    <div
                      className={`mt-2 font-serif text-2xl font-bold tracking-tight ${
                        isRoyal ? "text-amber-200" : "text-stone-900"
                      }`}
                    >
                      {t.name}
                    </div>
                    <p className="mt-2 text-[11px] opacity-75 max-w-[200px] mx-auto">
                      {isRoyal
                        ? "Rich crimson & gold ornamental borders with royal shehnai audio."
                        : "Clean editorial layout with sage accents and photo gallery."}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg p-2.5 text-center text-xs font-medium backdrop-blur-sm ${
                      isRoyal
                        ? "bg-black/30 border border-amber-400/20 text-amber-200"
                        : "bg-white/70 border border-stone-300/50 text-stone-700"
                    }`}
                  >
                    <span>Interactive WhatsApp Ready</span>
                  </div>
                </div>
              </div>

              {/* Template card meta info */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-stone-900">{t.name}</h3>
                  {t.from && (
                    <p className="text-xs font-semibold text-rose-700">
                      From ₹{t.from.price} <span className="text-stone-500 font-normal">/ {t.from.days} days access</span>
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5">
                  Popular
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href={`/try/${t.slug}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-stone-200/90 bg-stone-50/80 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-white hover:border-stone-300 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </Link>
                <Link
                  href={`/dashboard/create?template=${t.slug}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-900/15 hover:brightness-105 transition-all"
                >
                  <span>Select</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </TiltCard>
          </motion.div>
        );
      })}
    </Stagger>
  );
}

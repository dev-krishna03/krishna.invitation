"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "@/components/motion/TiltCard";
import { Sparkles, Eye, ArrowRight, Search, Star, Filter } from "lucide-react";

type Item = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  fromPrice?: { price: number; days: number } | null;
};

export function GalleryGrid({ items }: { items: Item[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["ALL", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((t) => {
    const matchesCategory = selectedCategory === "ALL" || t.category === selectedCategory;
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mt-8">
      {/* Controls: Search and Categories */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-stone-200/80 pb-6">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-rose-700 text-white shadow-sm shadow-rose-900/20"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              {cat === "ALL" ? "All Designs" : cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-1.5 pl-9 pr-4 text-xs text-stone-800 placeholder-stone-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-stone-800">No templates found</h3>
          <p className="mt-1 text-xs text-stone-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <motion.div layout className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((t) => {
              const isRoyal = t.slug.includes("royal");
              return (
                <motion.div
                  layout
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <TiltCard>
                    <div className="relative overflow-hidden rounded-xl">
                      {/* Realistic themed mockup preview */}
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
                            {t.category}
                          </span>
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full ${
                              isRoyal ? "bg-amber-400/20 text-amber-300" : "bg-white/80 text-stone-700"
                            }`}
                          >
                            <Star className="h-3.5 w-3.5 fill-current" />
                          </span>
                        </div>

                        <div className="text-center my-auto py-4">
                          <div className="text-[10px] uppercase tracking-[0.25em] opacity-80">
                            {isRoyal ? "॥ श्री गणेशाय नमः ॥" : "A New Beginning"}
                          </div>
                          <div
                            className={`mt-2 font-serif text-2xl font-bold tracking-tight ${
                              isRoyal ? "text-amber-200" : "text-stone-900"
                            }`}
                          >
                            {t.name}
                          </div>
                          <p className="mt-2 text-xs opacity-75 line-clamp-2 max-w-[220px] mx-auto">
                            {t.description ?? "Luxury digital invitation with audio & RSVP tracking."}
                          </p>
                        </div>

                        <div
                          className={`rounded-lg p-2 text-center text-xs font-medium backdrop-blur-sm ${
                            isRoyal
                              ? "bg-black/30 border border-amber-400/20 text-amber-200"
                              : "bg-white/70 border border-stone-300/50 text-stone-700"
                          }`}
                        >
                          <span>WhatsApp & Maps Ready</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-stone-900">{t.name}</h3>
                        {t.fromPrice ? (
                          <p className="text-xs font-semibold text-rose-700">
                            From ₹{t.fromPrice.price}{" "}
                            <span className="text-stone-500 font-normal">/ {t.fromPrice.days} days</span>
                          </p>
                        ) : (
                          <p className="text-xs text-stone-500">Flexible pricing</p>
                        )}
                      </div>
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-medium text-stone-700">
                        {t.category}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href={`/try/${t.slug}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-stone-200/90 bg-stone-50/80 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-white hover:border-stone-300 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Live Demo</span>
                      </Link>
                      <Link
                        href={`/dashboard/create?template=${t.slug}`}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-rose-900/15 hover:brightness-105 transition-all"
                      >
                        <span>Customize</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

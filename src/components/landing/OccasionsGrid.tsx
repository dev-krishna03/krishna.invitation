"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EventIcon } from "@/components/EventIcon";
import { Sparkles, ArrowRight } from "lucide-react";

type Item = {
  key: string;
  label: string;
  icon?: string;
  children?: { key: string; label: string; icon?: string }[];
};

const CATEGORIES = [
  { id: "all", label: "All Occasions" },
  { id: "wedding", label: "Weddings & Engagements" },
  { id: "milestone", label: "Birthdays & Family" },
  { id: "auspicious", label: "Gruh Vastu & Poojas" },
  { id: "corporate", label: "Corporate & More" },
];

export function OccasionsGrid({ items }: { items: Item[] }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredItems = items.filter((it) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "wedding") {
      return ["wedding", "engagement", "haldi", "mehndi", "sangeet", "reception"].includes(it.key);
    }
    if (activeCategory === "milestone") {
      return ["birthday", "baby-shower", "anniversary", "namkaran", "mundan"].includes(it.key);
    }
    if (activeCategory === "auspicious") {
      return ["gruh-vastu", "pooja", "festival"].includes(it.key);
    }
    if (activeCategory === "corporate") {
      return ["corporate", "graduation", "other"].includes(it.key);
    }
    return true;
  });

  return (
    <div className="mt-6">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-6">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-stone-900 text-white shadow-md shadow-stone-950/20"
                  : "bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-stone-100 hover:text-stone-900"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Grid of Occasion Cards */}
      <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredItems.map((it) => (
            <motion.div
              layout
              key={it.key}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-xl hover:shadow-rose-950/5"
            >
              {/* Subtle top card gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 text-rose-700 border border-rose-100 group-hover:scale-105 group-hover:bg-rose-100 transition-all">
                    <EventIcon name={it.icon} className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                      {it.label}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {it.children && it.children.length > 0
                        ? `${it.children.length} sub-ceremonies`
                        : "Single ceremony invitation"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/gallery?occasion=${it.key}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-stone-400 group-hover:bg-rose-600 group-hover:text-white transition-all"
                  aria-label={`Explore ${it.label}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Sub-events chips */}
              {it.children && it.children.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="flex flex-wrap gap-1.5">
                    {it.children.map((c) => (
                      <span
                        key={c.key}
                        className="inline-flex items-center gap-1 rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-600 border border-stone-200/60 group-hover:border-amber-200 group-hover:bg-amber-50/50 transition-colors"
                      >
                        <EventIcon name={c.icon} className="h-3 w-3 text-rose-600" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

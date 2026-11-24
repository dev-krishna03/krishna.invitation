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
  { id: "auspicious", label: "Griha Pravesh & Poojas" },
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
      return ["gruh-vastu", "pooja", "festival", "griha-pravesh"].includes(it.key);
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
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#6520EE] text-white shadow-md shadow-[#6520EE]/25 font-bold"
                  : "bg-white text-stone-600 border border-[#E5D9FC]/70 hover:bg-[#F5F1FE] hover:text-[#12042F]"
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={it.key}
            >
              <Link
                href={`/gallery?category=${it.key}`}
                className="group flex items-center justify-between rounded-3xl border border-[#E5D9FC]/70 bg-white p-5 shadow-sm hover:border-[#6520EE] hover:shadow-xl hover:shadow-[#6520EE]/10 transition-all no-underline"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] text-xl group-hover:scale-105 transition-transform">
                    {it.icon && !/^[a-z0-9_-]+$/i.test(it.icon) ? (
                      <span>{it.icon}</span>
                    ) : (
                      <EventIcon name={it.icon || it.key} className="h-5 w-5 text-[#6520EE]" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                      {it.label}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {it.children && it.children.length > 0
                        ? `${it.children.length} styles • Ready to send`
                        : "Digital invitation templates"}
                    </p>
                  </div>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 text-stone-400 group-hover:bg-[#6520EE] group-hover:text-white transition-all">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

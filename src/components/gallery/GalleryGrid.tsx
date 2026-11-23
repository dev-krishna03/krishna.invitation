"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TiltCard } from "@/components/motion/TiltCard";
import {
  Sparkles,
  Eye,
  ArrowRight,
  Search,
  Star,
  Filter,
  Clock,
  Check,
  ShieldCheck,
  Heart,
  Calendar,
  Layers,
} from "lucide-react";

type Item = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  fromPrice?: { price: number; days: number } | null;
};

const OCCASION_CATEGORIES = [
  { id: "ALL", label: "All Designs" },
  { id: "Wedding", label: "Wedding & Pheras" },
  { id: "Engagement", label: "Engagement & Roka" },
  { id: "Birthday", label: "Birthday Celebrations" },
  { id: "Baby Shower", label: "Baby Shower / Godh Bharai" },
  { id: "Anniversary", label: "Anniversary Milestones" },
  { id: "Housewarming", label: "Housewarming / Griha Pravesh" },
  { id: "Festival", label: "Festival (Diwali, Eid, Navratri)" },
  { id: "Corporate", label: "Corporate & Farewell" },
];

export function GalleryGrid({ items }: { items: Item[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlanModalItem, setActivePlanModalItem] = useState<Item | null>(null);

  const filtered = items.filter((t) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      t.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesStyle =
      selectedStyle === "ALL" ||
      t.category.toLowerCase().includes(selectedStyle.toLowerCase()) ||
      t.slug.toLowerCase().includes(selectedStyle.toLowerCase());

    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStyle && matchesQuery;
  });

  return (
    <div className="mt-8 space-y-6">
      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {OCCASION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-rose-700 text-white shadow-sm shadow-rose-900/20"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Controls: Search & Style Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Style Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Style:
          </span>
          {[
            { id: "ALL", label: "All Styles" },
            { id: "royal", label: "Royal Heritage" },
            { id: "floral", label: "Floral Pastel" },
            { id: "minimal", label: "Minimalist Modern" },
            { id: "traditional", label: "Traditional Vedic" },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedStyle === style.id
                  ? "bg-stone-900 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search occasion or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-1.5 pl-9 pr-4 text-xs text-stone-800 placeholder-stone-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-semibold text-stone-800">No templates found</h3>
          <p className="mt-1 text-xs text-stone-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((t) => {
              const isRoyal = t.slug.includes("royal");
              const basePrice = t.fromPrice?.price || 999;

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
                      {/* Mockup Card Display */}
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
                            {isRoyal ? "॥ श्री गणेशाय नमः ॥" : "Celebration of Love"}
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
                          <span>WhatsApp &amp; Maps Ready</span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata & Pricing Details */}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-stone-900">{t.name}</h3>
                        <p className="text-xs font-semibold text-rose-700">
                          From ₹{basePrice.toLocaleString()}{" "}
                          <span className="text-stone-500 font-normal">/ 15 days</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setActivePlanModalItem(t)}
                        className="rounded-full bg-stone-100 hover:bg-stone-200 px-2.5 py-1 text-[10px] font-bold text-rose-700 transition-colors cursor-pointer"
                      >
                        View Plans
                      </button>
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

      {/* ================= PAY-BY-DAYS PRICING MODAL ================= */}
      {activePlanModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  Pay-by-Days Pricing
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  {activePlanModalItem.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePlanModalItem(null)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Choose how long your digital invitation stays live online for guests.
              Extend anytime later by paying for more days!
            </p>

            {/* 4 Pay-by-Days Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                {
                  plan: "Basic",
                  days: 15,
                  mult: "Base × 1.0",
                  price: activePlanModalItem.fromPrice?.price || 999,
                  updates: "1 Live Update",
                  links: "5 Personal Links",
                },
                {
                  plan: "Standard",
                  days: 30,
                  mult: "Base × 1.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 1.5),
                  updates: "3 Live Updates",
                  links: "25 Personal Links",
                  highlight: true,
                },
                {
                  plan: "Premium",
                  days: 90,
                  mult: "Base × 2.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 2.5),
                  updates: "10 Live Updates",
                  links: "100 Personal Links",
                },
                {
                  plan: "Extended",
                  days: 180,
                  mult: "Base × 3.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 3.5),
                  updates: "Unlimited Updates",
                  links: "Unlimited Links",
                },
              ].map((tier) => (
                <div
                  key={tier.plan}
                  className={`rounded-2xl border p-4 flex flex-col justify-between ${
                    tier.highlight
                      ? "border-rose-400 bg-rose-50/40 ring-1 ring-rose-300 shadow-2xs"
                      : "border-stone-200 bg-stone-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-stone-900 text-sm">
                        {tier.plan} ({tier.days} Days)
                      </span>
                      {tier.highlight && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-xl font-bold text-stone-900">
                      ₹{tier.price.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-stone-500 font-semibold">{tier.mult}</span>

                    <ul className="mt-3 space-y-1 text-[11px] text-stone-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{tier.updates}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{tier.links}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp Personal Sending</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href={`/dashboard/create?template=${activePlanModalItem.slug}&days=${tier.days}`}
                    className={`mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                      tier.highlight
                        ? "bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                        : "bg-stone-900 text-white hover:bg-stone-800"
                    }`}
                  >
                    <span>Choose {tier.plan}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Platform & Creator Revenue Transparency */}
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-[11px] text-stone-600 flex items-center justify-between">
              <span>Creator Marketplace Split:</span>
              <span className="font-bold text-stone-800">90% goes to template creator • 10% platform fee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

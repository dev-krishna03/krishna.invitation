"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { Palette, Edit3, Send, Sparkles, CheckCircle } from "lucide-react";

const steps = [
  {
    n: 1,
    title: "Select an Aesthetic",
    icon: Palette,
    body: "Explore royal Rajasthani palaces, modern minimalist sages, floral pastel, or gold-embossed themes.",
    badge: "Step 01",
  },
  {
    n: 2,
    title: "Personalize with Story & Audio",
    icon: Edit3,
    body: "Enter muhurats, multi-day functions, venue pins on Google Maps, couple photos, and background sitar/shehnai music.",
    badge: "Step 02",
  },
  {
    n: 3,
    title: "Share via WhatsApp in 1-Click",
    icon: Send,
    body: "Generate individualized links with guest names. Send straight through WhatsApp with customized preview cards.",
    badge: "Step 03",
  },
  {
    n: 4,
    title: "Track RSVPs & Guest Count",
    icon: CheckCircle,
    body: "Watch live RSVP responses, headcount, dietary requirements, and heartfelt blessings in your host portal.",
    badge: "Step 04",
  },
];

export function HowItWorks() {
  return (
    <Stagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.12}>
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.n}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-rose-950/5 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent text-rose-700 border border-rose-200/50 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                  {s.badge}
                </span>
              </div>

              <h3 className="mt-5 font-serif text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{s.body}</p>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-4 border-t border-stone-100 text-[11px] font-semibold text-rose-700 opacity-80 group-hover:opacity-100">
              <Sparkles className="h-3 w-3" />
              <span>Effortless & Instant</span>
            </div>
          </motion.div>
        );
      })}
    </Stagger>
  );
}

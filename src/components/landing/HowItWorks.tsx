"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { Palette, Edit3, Send, CheckCircle, Sparkles } from "lucide-react";

const steps = [
  {
    n: 1,
    title: "Choose a design",
    icon: Palette,
    body: "Browse through royal palace gardens, elegant floral pastels, or modern minimal web themes.",
    badge: "Step 01",
  },
  {
    n: 2,
    title: "Fill in event details",
    icon: Edit3,
    body: "Add your names, sacred muhurats, multi-day function schedules, Google Maps pins, and photos.",
    badge: "Step 02",
  },
  {
    n: 3,
    title: "Share on WhatsApp",
    icon: Send,
    body: "Send a common link or personalised links where each guest opens to 'Dear Mr. Sharma & Family'.",
    badge: "Step 03",
  },
  {
    n: 4,
    title: "Track live RSVPs",
    icon: CheckCircle,
    body: "Watch guest confirmations, headcount, food choices, and blessings update live on your dashboard.",
    badge: "Step 04",
  },
];

export function HowItWorks() {
  return (
    <Stagger className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" gap={0.1}>
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.n}
            variants={staggerItem}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col justify-between rounded-3xl border border-[#E5D9FC]/70 bg-white p-6 shadow-sm hover:border-[#6520EE] hover:shadow-xl hover:shadow-[#6520EE]/10 transition-all"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] group-hover:bg-[#6520EE] group-hover:text-white transition-all duration-200">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-2.5 py-1 rounded-full border border-[#E5D9FC]">
                  {s.badge}
                </span>
              </div>

              <h3 className="mt-5 text-base font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                {s.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">{s.body}</p>
            </div>

            <div className="mt-6 flex items-center gap-1.5 pt-4 border-t border-stone-100 text-[11px] font-semibold text-[#6520EE]">
              <Sparkles className="h-3 w-3" />
              <span>Takes less than 5 minutes</span>
            </div>
          </motion.div>
        );
      })}
    </Stagger>
  );
}

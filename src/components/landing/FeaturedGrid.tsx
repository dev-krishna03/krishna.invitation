"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { Sparkles, Eye, ArrowRight, Music, Smartphone } from "lucide-react";

type Item = {
  id: string;
  slug: string;
  name: string;
  thumbnail_url?: string | null;
  from?: { price: number; days: number };
};

export function FeaturedGrid({ items }: { items: Item[] }) {
  return (
    <Stagger className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((t) => {
        const isRoyal = t.slug.includes("royal");
        return (
          <motion.div key={t.id} variants={staggerItem}>
            <div className="group overflow-hidden rounded-3xl border border-[#E5D9FC]/80 bg-white p-3.5 shadow-sm hover:border-[#6520EE] hover:shadow-xl hover:shadow-[#6520EE]/10 transition-all">
              {/* Template Card Visual Preview */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F1FE] via-[#FAF9FD] to-[#EBE2FD] p-5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.01]">
                {t.thumbnail_url && (
                  <>
                    <img
                      src={t.thumbnail_url}
                      alt={t.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
                  </>
                )}

                <div className="relative z-10 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                    t.thumbnail_url
                      ? "bg-black/60 text-white backdrop-blur-md border border-white/20"
                      : "bg-white/95 text-[#6520EE]"
                  }`}>
                    {isRoyal ? "Royal Palace" : "Modern Minimal"}
                  </span>
                  <span className="rounded-full bg-[#6520EE] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                    Featured
                  </span>
                </div>

                <div className={`text-center my-auto py-4 relative z-10 ${t.thumbnail_url ? "text-white" : ""}`}>
                  <div className={`text-[10px] uppercase font-bold tracking-[0.2em] ${
                    t.thumbnail_url ? "text-amber-300" : "text-[#6520EE]/80"
                  }`}>
                    {isRoyal ? "॥ Shahi Nimantran ॥" : "Digital Website Invite"}
                  </div>
                  <h4 className={`mt-2 text-xl font-bold tracking-tight ${
                    t.thumbnail_url ? "text-white drop-shadow-md" : "text-[#12042F]"
                  }`}>
                    {t.name}
                  </h4>
                  <p className={`mt-2 text-xs line-clamp-2 max-w-[220px] mx-auto ${
                    t.thumbnail_url ? "text-stone-200 drop-shadow-xs" : "text-stone-600"
                  }`}>
                    {isRoyal
                      ? "Doors that open onto palace gardens, Shehnai audio, and sacred Muhurat cards."
                      : "Editorial typography, romantic background melody, and 1-click WhatsApp RSVP."}
                  </p>
                </div>

                <div className={`relative z-10 flex items-center justify-between rounded-xl backdrop-blur-md p-2 px-3 text-[11px] font-semibold border ${
                  t.thumbnail_url
                    ? "bg-black/50 text-white border-white/20"
                    : "bg-white/80 text-stone-700 border-white/60"
                }`}>
                  <span className={`flex items-center gap-1.5 ${t.thumbnail_url ? "text-amber-300" : "text-[#6520EE]"}`}>
                    <Music className="h-3 w-3" />
                    <span>Background Song</span>
                  </span>
                  <span className={`flex items-center gap-1.5 ${t.thumbnail_url ? "text-stone-300" : "text-stone-500"}`}>
                    <Smartphone className="h-3 w-3" />
                    <span>WhatsApp Ready</span>
                  </span>
                </div>
              </div>

              {/* Template Meta Info */}
              <div className="mt-4 px-2 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                    {t.name}
                  </h3>
                  {t.from && (
                    <p className="text-xs font-bold text-[#6520EE]">
                      ₹{t.from.price.toLocaleString()}{" "}
                      <span className="text-stone-400 font-normal">/ {t.from.days} days</span>
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC] text-[10px] font-bold px-2.5 py-0.5">
                  Live Demo
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <Link
                  href={`/try/${t.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-3 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] transition-colors no-underline"
                >
                  <Eye className="h-3.5 w-3.5 text-[#6520EE]" />
                  <span>Preview</span>
                </Link>
                <Link
                  href={`/dashboard/create?template=${t.slug}`}
                  className="inline-flex items-center justify-center gap-1 rounded-full bg-[#6520EE] hover:bg-[#5213D2] px-3 py-2 text-xs font-bold text-white shadow-sm shadow-[#6520EE]/20 transition-all no-underline"
                >
                  <span>Select</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </Stagger>
  );
}

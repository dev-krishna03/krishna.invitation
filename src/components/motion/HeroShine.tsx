"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function HeroShine({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative overflow-hidden">
      {!reduce && (
        <>
          {/* Top Center Champagne/Rose ambient bloom */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-200/50 via-rose-200/40 to-transparent blur-3xl opacity-75"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Left Warm Amber glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-20 -left-20 h-[380px] w-[380px] rounded-full bg-gradient-to-tr from-amber-300/30 to-rose-200/20 blur-3xl"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 1.8, delay: 0.2 }}
          />

          {/* Right Auspicious Rose glow */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-40 -right-20 h-[450px] w-[450px] rounded-full bg-gradient-to-bl from-rose-300/30 via-amber-200/20 to-transparent blur-3xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ duration: 1.8, delay: 0.3 }}
          />

          {/* Subtle geometric mandala or celebratory grid watermark */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px]"
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

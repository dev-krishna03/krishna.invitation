"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function HeroShine({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="relative overflow-hidden">
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-br from-amber-200/60 via-rose-200/50 to-transparent blur-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-emerald-200/40 to-transparent blur-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 1.6, delay: 0.3 }}
          />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

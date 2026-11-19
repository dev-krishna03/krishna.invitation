"use client";

import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-40, 40], [6, -6]);
  const ry = useTransform(x, [-40, 40], [-6, 6]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 80);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 80);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      whileHover={reduce ? undefined : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className={`rounded-2xl border border-stone-200/80 bg-white/95 p-4 shadow-sm hover:border-amber-300 hover:shadow-xl hover:shadow-stone-900/5 transition-colors will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  );
}

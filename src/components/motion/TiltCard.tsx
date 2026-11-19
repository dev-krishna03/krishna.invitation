"use client";

import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function TiltCard({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useTransform(y, [-40, 40], [8, -8]);
  const ry = useTransform(x, [-40, 40], [-8, 8]);

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
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      className="rounded-xl border bg-white p-4 shadow-sm will-change-transform"
    >
      {children}
    </motion.div>
  );
}

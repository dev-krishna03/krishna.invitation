"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "luxury" | "secondary" | "ghost";
  className?: string;
} & Omit<ComponentProps<typeof motion.button>, "children" | "ref">;

export function AnimatedButton({
  children,
  href,
  onClick,
  variant = "primary",
  className = "",
  ...rest
}: Props) {
  const reduce = useReducedMotion();

  let base = "";
  if (variant === "primary") {
    base =
      "bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-md shadow-stone-950/10 border border-stone-800";
  } else if (variant === "luxury") {
    base =
      "bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 text-white shadow-md shadow-rose-900/20 hover:shadow-lg hover:shadow-rose-900/30 hover:brightness-105 border border-rose-500/30";
  } else if (variant === "secondary") {
    base =
      "bg-amber-50 text-amber-900 border border-amber-300/80 hover:bg-amber-100/70 shadow-sm";
  } else {
    base =
      "bg-white/80 backdrop-blur-sm text-stone-700 border border-stone-300 hover:bg-white hover:text-stone-950 shadow-sm";
  }

  const motionProps = reduce
    ? {}
    : {
        whileHover: { y: -2, scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring" as const, stiffness: 350, damping: 20 },
      };

  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer ${base} ${className}`;

  if (href) {
    return (
      <motion.span {...motionProps} className="inline-block">
        <Link href={href} className={classes}>
          {children}
        </Link>
      </motion.span>
    );
  }
  return (
    <motion.button {...motionProps} onClick={onClick} className={classes} {...rest}>
      {children}
    </motion.button>
  );
}

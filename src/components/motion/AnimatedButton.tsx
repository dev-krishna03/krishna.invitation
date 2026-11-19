"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
} & Omit<ComponentProps<typeof motion.button>, "children" | "ref">;

export function AnimatedButton({ children, href, onClick, variant = "primary", className = "", ...rest }: Props) {
  const reduce = useReducedMotion();
  const base =
    variant === "primary"
      ? "bg-black text-white hover:bg-neutral-800"
      : "border border-gray-300 hover:bg-gray-50";

  const motionProps = reduce
    ? {}
    : {
        whileHover: { y: -2, scale: 1.03 },
        whileTap: { scale: 0.97 },
        transition: { type: "spring" as const, stiffness: 320, damping: 22 },
      };

  const classes = `inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-colors ${base} ${className}`;

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

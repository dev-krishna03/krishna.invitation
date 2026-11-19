"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";
import { EventIcon } from "@/components/EventIcon";

type Item = {
  key: string;
  label: string;
  icon?: string;
  children?: { key: string; label: string; icon?: string }[];
};

export function OccasionsGrid({ items }: { items: Item[] }) {
  return (
    <Stagger className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.04}>
      {items.map((it) => (
        <motion.div
          key={it.key}
          variants={staggerItem}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="group rounded-xl border bg-white p-4 shadow-sm transition-colors hover:border-rose-300"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-rose-50 text-rose-700 transition-colors group-hover:bg-rose-100">
              <EventIcon name={it.icon} className="h-5 w-5" />
            </span>
            <span className="font-medium">{it.label}</span>
          </div>
          {it.children && it.children.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {it.children.map((c) => (
                <li
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
                >
                  <EventIcon name={c.icon} className="h-3 w-3" />
                  {c.label}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}
    </Stagger>
  );
}

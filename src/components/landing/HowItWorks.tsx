"use client";

import { motion } from "framer-motion";
import { Stagger, staggerItem } from "@/components/motion/Reveal";

const steps = [
  { n: 1, title: "Choose a Template", body: "Pick a design that fits your event and culture." },
  { n: 2, title: "Customize", body: "Add names, events, photos and your story." },
  { n: 3, title: "Share", body: "Send personal links by WhatsApp and track RSVPs." },
];

export function HowItWorks() {
  return (
    <Stagger className="mt-6 grid gap-6 sm:grid-cols-3" gap={0.12}>
      {steps.map((s) => (
        <motion.div
          key={s.n}
          variants={staggerItem}
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="rounded-xl border bg-white p-5 shadow-sm"
        >
          <motion.span
            whileHover={{ rotate: 8, scale: 1.1 }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm"
          >
            {s.n}
          </motion.span>
          <h3 className="mt-3 font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-gray-600">{s.body}</p>
        </motion.div>
      ))}
    </Stagger>
  );
}

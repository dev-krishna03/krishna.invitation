"use client";

import { motion, type Variants } from "framer-motion";
import type { TemplateProps } from "@/types/template";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Event = { name: string; venue?: string | null; address?: string | null; date?: string | Date | null; start_time?: string | null };

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export default function MinimalLoveTemplate({ data, guestName }: TemplateProps) {
  const primary = (data.primaryName as string) ?? "";
  const secondary = (data.secondaryName as string) ?? "";
  const message = (data.message as string) ?? "";
  const events = (data.events as Event[]) ?? [];
  const photos = (data.photos as { url: string; caption?: string }[]) ?? [];

  return (
    <div className="min-h-screen bg-white text-neutral-800">
      <motion.section
        className="mx-auto max-w-2xl px-6 pt-20 pb-12 text-center"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
      >
        <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.4em] text-emerald-700">
          You're invited
        </motion.p>
        <motion.h1 variants={fadeUp} className="mt-6 font-light tracking-tight text-5xl">
          {primary} <span className="text-neutral-400">+</span> {secondary}
        </motion.h1>
        {guestName && (
          <motion.p variants={fadeUp} className="mt-6 text-sm">
            Dear {guestName},
          </motion.p>
        )}
        {message && (
          <motion.p variants={fadeUp} className="mt-6 leading-relaxed text-neutral-600">
            {message}
          </motion.p>
        )}
      </motion.section>

      <motion.section
        className="mx-auto max-w-2xl px-6 pb-16"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
      >
        <ul className="divide-y">
          {events.map((e, i) => (
            <motion.li key={i} variants={fadeUp} className="py-5">
              <h3 className="text-lg">{e.name}</h3>
              <p className="text-sm text-neutral-500">
                {fmtDate(e.date)}
                {e.start_time ? ` · ${e.start_time}` : ""}
              </p>
              {e.venue && <p className="mt-1 text-sm">{e.venue}</p>}
              {e.address && <p className="text-xs text-neutral-500">{e.address}</p>}
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {photos.length > 0 && (
        <motion.section
          className="mx-auto max-w-2xl px-6 pb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <motion.img
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                src={p.url}
                alt={p.caption ?? ""}
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}

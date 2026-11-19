"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import type { TemplateProps } from "@/types/template";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Event = { name: string; venue?: string | null; address?: string | null; date?: string | Date | null; start_time?: string | null };

function fmtDate(d: string | Date | null | undefined): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function RoyalEleganceTemplate({ data, guestName, mapApiKey, isPreview }: TemplateProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(isPreview ? true : false);

  const primary = (data.primaryName as string) ?? "";
  const secondary = (data.secondaryName as string) ?? "";
  const hashtag = (data.hashtag as string) ?? "";
  const message = (data.message as string) ?? "";
  const theme = ((data.theme as string) ?? "#8b1e3f").toString();
  const events = (data.events as Event[]) ?? [];
  const photos = (data.photos as { url: string; caption?: string }[]) ?? [];
  const family = (data.family as string[]) ?? [];

  const style = useMemo(
    () => ({ background: `linear-gradient(180deg, #fdf6ee, #f7e9d7)`, color: "#2b1b17", ["--accent" as never]: theme }),
    [theme],
  );

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
  };

  return (
    <div style={style} className="min-h-screen font-serif">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="envelope"
            className="relative mx-auto grid min-h-screen max-w-md place-items-center px-6 py-10"
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={reduce ? false : { rotateX: 0 }}
              whileHover={reduce ? undefined : { y: -4 }}
              onClick={() => setOpen(true)}
              className="cursor-pointer select-none"
              style={{ perspective: 1200 }}
            >
              <div
                className="relative h-72 w-96 overflow-hidden rounded-xl shadow-2xl"
                style={{ background: "linear-gradient(135deg, #e2c184, #a37234)" }}
              >
                <div className="absolute inset-0 grid place-items-center text-center text-white">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] opacity-80">You are invited</p>
                    <p className="mt-3 text-3xl font-semibold">{primary || "A Beautiful Story"}</p>
                    {secondary && <p className="text-sm opacity-80">& {secondary}</p>}
                    <p className="mt-6 text-xs opacity-70">Tap to open</p>
                  </div>
                </div>
                <motion.div
                  className="absolute inset-x-0 top-0 h-1/2 origin-top"
                  initial={{ rotateX: 0 }}
                  whileHover={reduce ? undefined : { rotateX: -45 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(180deg, #d9a86a, #b1803a)",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    transformStyle: "preserve-3d",
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.section
              className="px-6 pt-16 pb-10 text-center"
              initial="hidden"
              animate="show"
              variants={sectionVariants}
            >
              <p className="tracking-[0.3em] text-xs uppercase" style={{ color: theme }}>
                Together with our families
              </p>
              <motion.h1
                className="mt-4 text-5xl leading-tight"
                initial={reduce ? false : { letterSpacing: "0.3em", opacity: 0 }}
                animate={{ letterSpacing: "0.02em", opacity: 1 }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                {primary}
                <span className="mx-3 opacity-60">&amp;</span>
                {secondary}
              </motion.h1>
              {hashtag && <p className="mt-4 text-sm opacity-70">{hashtag}</p>}
              {guestName && (
                <motion.p
                  className="mt-6 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Dear <span className="font-semibold">{guestName}</span>, you are invited.
                </motion.p>
              )}
            </motion.section>

            {message && (
              <motion.section
                className="px-8 pb-10 text-center italic opacity-80"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={sectionVariants}
              >
                {message}
              </motion.section>
            )}

            <motion.section
              className="px-6 pb-12"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={sectionVariants}
            >
              <h2 className="text-center text-2xl uppercase tracking-widest" style={{ color: theme }}>
                Events
              </h2>
              <motion.ul
                className="mt-6 space-y-5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
              >
                {events.map((e, i) => (
                  <motion.li
                    key={i}
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
                    whileHover={{ y: -2 }}
                    className="rounded-xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur"
                  >
                    <h3 className="text-xl">{e.name}</h3>
                    {e.venue && <p className="text-sm opacity-80">{e.venue}</p>}
                    {e.address && <p className="text-xs opacity-60">{e.address}</p>}
                    <p className="mt-2 text-sm">
                      {fmtDate(e.date)}
                      {e.start_time ? ` · ${e.start_time}` : ""}
                    </p>
                    {e.address && mapApiKey && (
                      <iframe
                        className="mt-3 h-40 w-full rounded-lg"
                        loading="lazy"
                        src={`https://www.google.com/maps/embed/v1/place?key=${mapApiKey}&q=${encodeURIComponent(e.address)}`}
                      />
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.section>

            {photos.length > 0 && (
              <motion.section
                className="px-6 pb-12"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={sectionVariants}
              >
                <h2 className="text-center text-2xl uppercase tracking-widest" style={{ color: theme }}>
                  Memories
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {photos.map((p, i) => (
                    <motion.img
                      key={i}
                      src={p.url}
                      alt={p.caption ?? ""}
                      className="aspect-square w-full rounded-lg object-cover"
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 240, damping: 20 }}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {family.length > 0 && (
              <motion.section
                className="px-6 pb-12 text-center"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                variants={sectionVariants}
              >
                <h2 className="text-2xl uppercase tracking-widest" style={{ color: theme }}>
                  Family
                </h2>
                <ul className="mt-4 space-y-1 text-sm">
                  {family.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </motion.section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

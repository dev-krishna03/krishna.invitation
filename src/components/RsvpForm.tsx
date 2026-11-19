"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

type Props = {
  slug: string;
  guestSlug?: string;
  prefilledName?: string;
};

const choices = [
  { value: "ACCEPTED", label: "Joyfully", emoji: "🎉" },
  { value: "MAYBE", label: "Maybe", emoji: "🤔" },
  { value: "DECLINED", label: "Decline", emoji: "💔" },
] as const;

export function RsvpForm({ slug, guestSlug, prefilledName }: Props) {
  const reduce = useReducedMotion();
  const [name, setName] = useState(prefilledName ?? "");
  const [message, setMessage] = useState("");
  const [plus, setPlus] = useState(0);
  const [status, setStatus] = useState<"PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE">("PENDING");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/track/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, guestSlug }),
    }).catch(() => {});
  }, [slug, guestSlug]);

  async function submit() {
    setError(null);
    setSubmitting(true);
    const url = guestSlug ? `/api/rsvp/${slug}/${guestSlug}` : `/api/rsvp/${slug}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, message, plus_allowed: plus, status }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    setSubmitted(true);
  }

  return (
    <section className="relative overflow-hidden bg-white px-6 py-14">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 20 }}
            className="mx-auto max-w-md rounded-2xl bg-emerald-50 p-10 text-center text-emerald-900"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.1 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-200 text-3xl"
            >
              ✓
            </motion.div>
            <h3 className="mt-4 text-xl font-semibold">Thank you!</h3>
            <p className="mt-2 text-sm">Your RSVP is recorded.</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto max-w-md"
          >
            <h2 className="text-center text-2xl font-semibold">RSVP</h2>
            <div className="mt-6 space-y-3">
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border px-3 py-2 outline-none transition focus:border-black"
              />
              <textarea
                placeholder="A message to the hosts (optional)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-24 w-full rounded-md border px-3 py-2 outline-none transition focus:border-black"
              />
              <label className="block text-sm">
                Plus-ones:
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={plus}
                  onChange={(e) => setPlus(parseInt(e.target.value || "0", 10))}
                  className="ml-2 w-16 rounded-md border px-2 py-1"
                />
              </label>
              <div className="grid grid-cols-3 gap-2">
                {choices.map((c) => (
                  <motion.button
                    key={c.value}
                    onClick={() => setStatus(c.value)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    animate={status === c.value ? { backgroundColor: "#000", color: "#fff" } : { backgroundColor: "#fff", color: "#000" }}
                    transition={{ duration: 0.2 }}
                    className="rounded-md border py-2 text-sm"
                  >
                    <span className="mr-1">{c.emoji}</span>
                    {c.label}
                  </motion.button>
                ))}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
              <motion.button
                onClick={submit}
                disabled={!name || status === "PENDING" || submitting}
                whileTap={!submitting ? { scale: 0.98 } : undefined}
                className="relative w-full overflow-hidden rounded-md bg-black py-2.5 text-white disabled:opacity-60"
              >
                <motion.span
                  key={submitting ? "loading" : "idle"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block"
                >
                  {submitting ? "Sending…" : "Submit RSVP"}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

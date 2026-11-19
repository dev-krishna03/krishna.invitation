"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";

const CODE_LEN = 6;

export default function KrishnaGatePage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(""));
  const [state, setState] = useState<"idle" | "checking" | "error" | "ok">("idle");
  const [error, setError] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function setDigit(i: number, v: string) {
    const ch = v.replace(/\D/g, "").slice(-1);
    const next = digits.slice();
    next[i] = ch;
    setDigits(next);
    if (ch && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
    setError(null);
    if (next.every((d) => d) && state !== "checking") submit(next.join(""));
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
    if (e.key === "ArrowRight" && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LEN);
    if (!text) return;
    e.preventDefault();
    const next = text.split("").concat(Array(CODE_LEN).fill("")).slice(0, CODE_LEN);
    setDigits(next);
    refs.current[Math.min(text.length, CODE_LEN - 1)]?.focus();
    if (text.length === CODE_LEN) submit(text);
  }

  async function submit(code: string) {
    setState("checking");
    const res = await fetch("/api/krishna", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (res.ok) {
      setState("ok");
      setTimeout(() => router.push("/krishna/admin"), 500);
    } else {
      setState("error");
      setError("Incorrect code");
      setDigits(Array(CODE_LEN).fill(""));
      refs.current[0]?.focus();
      setTimeout(() => setState("idle"), 600);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-fuchsia-600/30 via-amber-500/20 to-transparent blur-3xl" />
        <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-emerald-500/20 to-transparent blur-3xl" />
      </motion.div>

      <div className="relative mx-auto grid min-h-screen max-w-md place-items-center px-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={state === "error" ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: state === "error" ? 0.4 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
        >
          <p className="text-center text-xs uppercase tracking-[0.3em] text-white/60">
            Restricted Access
          </p>
          <h1 className="mt-3 text-center text-2xl font-semibold">Enter admin code</h1>
          <p className="mt-2 text-center text-xs text-white/50">
            6-digit code required to open the Super Admin panel.
          </p>

          <div className="mt-8 flex justify-center gap-2">
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={onPaste}
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                animate={
                  state === "ok"
                    ? { borderColor: "#10b981", color: "#10b981" }
                    : state === "error"
                      ? { borderColor: "#ef4444" }
                      : { borderColor: "rgba(255,255,255,0.2)" }
                }
                transition={{ duration: 0.2 }}
                className="h-14 w-11 rounded-lg border-2 bg-white/5 text-center text-2xl font-mono outline-none focus:border-white/60"
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-sm text-red-400"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state === "checking" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-4 text-center text-xs text-white/60"
              >
                Checking…
              </motion.p>
            )}
            {state === "ok" && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm text-emerald-400"
              >
                ✓ Unlocked — opening panel…
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

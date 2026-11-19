"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, Delete, KeyRound, CheckCircle2, Lock } from "lucide-react";

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

  function handleKeypadPress(num: string) {
    if (state === "checking" || state === "ok") return;
    const firstEmpty = digits.findIndex((d) => !d);
    if (firstEmpty !== -1) {
      setDigit(firstEmpty, num);
    }
  }

  function handleKeypadBackspace() {
    if (state === "checking" || state === "ok") return;
    const lastFilled = digits.map((d) => !!d).lastIndexOf(true);
    if (lastFilled !== -1) {
      const next = digits.slice();
      next[lastFilled] = "";
      setDigits(next);
      refs.current[lastFilled]?.focus();
      setError(null);
    }
  }

  function handleKeypadClear() {
    setDigits(Array(CODE_LEN).fill(""));
    setError(null);
    refs.current[0]?.focus();
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
      setTimeout(() => router.push("/krishna/admin"), 400);
    } else {
      setState("error");
      setError("Incorrect authorization code");
      setDigits(Array(CODE_LEN).fill(""));
      refs.current[0]?.focus();
      setTimeout(() => setState("idle"), 600);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-stone-950 text-white selection:bg-rose-500 selection:text-white">
      {/* Ambient background glows */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-1/4 h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-gradient-to-br from-rose-600/25 via-amber-500/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-amber-600/15 to-transparent blur-3xl" />
      </motion.div>

      <div className="relative mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-8">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.97 }}
          animate={
            state === "error"
              ? { x: [0, -10, 10, -8, 8, -4, 4, 0] }
              : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: state === "error" ? 0.4 : 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full rounded-3xl border border-stone-800 bg-stone-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Top Emblem */}
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white shadow-lg shadow-rose-950/50">
              <Shield className="h-6 w-6" />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
              Restricted Area
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-white">
              Super Admin Gate
            </h1>
            <p className="mt-1 text-xs text-stone-400">
              Enter 6-digit access code to manage platform
            </p>
          </div>

          {/* 6 Digit Inputs */}
          <div className="mt-6 flex justify-center gap-2">
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => onKey(i, e)}
                onPaste={onPaste}
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                animate={
                  state === "ok"
                    ? { borderColor: "#10b981", scale: 1.05 }
                    : state === "error"
                      ? { borderColor: "#ef4444" }
                      : d
                        ? { borderColor: "#f59e0b" }
                        : { borderColor: "rgba(255,255,255,0.12)" }
                }
                transition={{ duration: 0.15 }}
                className="h-12 w-10 sm:h-14 sm:w-11 rounded-xl border-2 bg-stone-950/70 text-center font-mono text-xl sm:text-2xl font-bold text-white outline-none focus:border-amber-400 focus:bg-stone-950 shadow-inner"
              />
            ))}
          </div>

          {/* Status & Error Feedback */}
          <div className="min-h-[28px] mt-3">
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs font-semibold text-rose-400"
                >
                  {error}
                </motion.p>
              )}
              {state === "checking" && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-xs text-amber-300 flex items-center justify-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  Verifying credentials…
                </motion.p>
              )}
              {state === "ok" && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Access Authorized • Opening Console…
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Touch-Friendly Numeric Keypad for Mobile */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-stone-800/80 pt-4">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="h-11 rounded-xl border border-stone-800 bg-stone-950/60 font-mono text-base font-semibold text-stone-200 active:bg-amber-500/20 active:text-amber-300 transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleKeypadClear}
              className="h-11 rounded-xl border border-stone-800/60 bg-stone-950/40 text-[11px] font-semibold text-stone-500 hover:text-stone-300 active:bg-stone-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="h-11 rounded-xl border border-stone-800 bg-stone-950/60 font-mono text-base font-semibold text-stone-200 active:bg-amber-500/20 active:text-amber-300 transition-colors"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              className="h-11 flex items-center justify-center rounded-xl border border-stone-800/60 bg-stone-950/40 text-stone-400 hover:text-stone-200 active:bg-stone-800"
              aria-label="Backspace"
            >
              <Delete className="h-4 w-4" />
            </button>
          </div>

          {/* Dev Hint */}
          <div className="mt-5 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-950/80 px-3 py-1 text-[10px] text-stone-500 font-mono border border-stone-800">
              <KeyRound className="h-3 w-3 text-amber-500" />
              <span>Default PIN: 123456</span>
            </span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

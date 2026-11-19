"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    }
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter your account email to receive a secure password reset link."
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-900">Check Your Inbox</h3>
          <p className="mt-2 text-xs text-stone-600 leading-relaxed">
            We’ve emailed a secure password reset link to <strong className="text-stone-800">{email}</strong>.
          </p>
          <div className="mt-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800"
            >
              <span>Return to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? "Sending Link…" : "Send Reset Link"}</span>
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
            >
              ← Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
}

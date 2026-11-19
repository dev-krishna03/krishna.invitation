"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") ?? undefined;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode: ref }),
      });
      setLoading(false);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Registration failed");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <AuthShell
      title="Create Your Host Account"
      subtitle="Craft royal, interactive wedding & celebration invitations with music and instant WhatsApp RSVP."
    >
      <form onSubmit={onSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name</label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              required
              placeholder="e.g. Krishna & Radhika"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-10 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all"
            />
          </div>
        </div>

        {/* Referral badge */}
        {ref && (
          <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <Tag className="h-3.5 w-3.5 text-amber-600" />
            <span>Referral Code Applied: <strong className="font-mono">{ref}</strong></span>
          </div>
        )}

        {/* Error message */}
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

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all disabled:opacity-60 cursor-pointer"
        >
          <span>{loading ? "Creating Account…" : "Create Host Account"}</span>
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </motion.button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Already have an account? </span>
        <Link href="/login" className="font-bold text-rose-700 hover:text-rose-800 transition-colors">
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

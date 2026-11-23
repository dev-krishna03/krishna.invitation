"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Send, ShieldCheck, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  async function performLogin(targetEmail: string, targetPass: string) {
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Fallback to Supabase client directly if API route returned error
        try {
          const supabase = createClient();
          const { error: sbError } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: targetPass,
          });
          if (sbError) {
            setError(data.error || sbError.message);
            return;
          }
        } catch {
          setError(data.error || "Failed to sign in");
          return;
        }
      }

      const redirectPath = targetEmail.includes("admin") ? "/krishna/admin" : next;
      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performLogin(email, password);
  }

  async function fillAndLogin(eMail: string, pWord: string) {
    setEmail(eMail);
    setPassword(pWord);
    await performLogin(eMail, pWord);
  }

  async function withGoogle() {
    setError(null);
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/api/auth/callback?next=${next}` },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google authentication failed");
    }
  }

  async function magicLink() {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setMagicLoading(true);
    setError(null);
    setInfo(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}/api/auth/callback?next=${next}` },
      });
      if (error) {
        setError(error.message);
      } else {
        setInfo("✨ Magic login link sent to your email! Please check your inbox.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setMagicLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Sign in to your host & creator portal to manage your celebration invitations and real-time RSVPs."
    >
      {/* 1-Click Demo Credentials Quick-Fill Banner */}
      <div className="mb-5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-stone-50 p-3.5 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <p className="text-xs font-bold text-stone-900">Instant Demo Access</p>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Ready to test
          </span>
        </div>
        <p className="text-[11px] text-stone-600 mb-2.5 leading-relaxed">
          Click any role below to pre-fill credentials and sign in immediately with pre-seeded data:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillAndLogin("demo@krishnaweddings.com", "krishna2026")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-900 group-hover:text-rose-700 truncate">
                Host & Creator
              </div>
              <div className="text-[10px] text-stone-500 font-mono truncate">
                demo@krishnaweddings.com
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => fillAndLogin("admin@krishnaweddings.com", "admin2026")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-sm text-left transition-all cursor-pointer group"
          >
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-stone-900 group-hover:text-amber-700 truncate">
                Super Admin
              </div>
              <div className="text-[10px] text-stone-500 font-mono truncate">
                admin@krishnaweddings.com
              </div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="email"
              required
              placeholder="demo@krishnaweddings.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all"
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-stone-700">Password</label>
            <Link
              href="/forgot-password"
              className="text-[11px] font-semibold text-rose-700 hover:text-rose-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
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

        {/* Alerts */}
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
          {info && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-medium text-emerald-800"
            >
              {info}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all disabled:opacity-60 cursor-pointer"
        >
          <span>{loading ? "Signing in…" : "Sign In to Dashboard"}</span>
          {!loading && <ArrowRight className="h-3.5 w-3.5" />}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Social / Alternative logins */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={withGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200/90 bg-white py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50 transition-colors cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={magicLink}
          disabled={magicLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200/90 bg-stone-50/70 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <Send className="h-3.5 w-3.5 text-amber-600" />
          <span>{magicLoading ? "Sending Link…" : "Send Passwordless Magic Link"}</span>
        </button>
      </div>

      {/* Switch to Register */}
      <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
        <span>Don't have an account yet? </span>
        <Link href="/register" className="font-bold text-rose-700 hover:text-rose-800 transition-colors">
          Create one now
        </Link>
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FAF8F5]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

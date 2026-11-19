"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <p className="mt-1 text-sm text-gray-600">We will email you a secure link</p>

      {sent ? (
        <p className="mt-6 text-sm">Check your email for a reset link.</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-md bg-black py-2 text-white">Send reset link</button>
        </form>
      )}

      <div className="mt-6 text-sm">
        <Link href="/login" className="underline">Back to login</Link>
      </div>
    </div>
  );
}

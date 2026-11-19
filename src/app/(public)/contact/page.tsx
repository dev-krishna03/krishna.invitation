"use client";

import { useState } from "react";
import { PublicPageShell } from "@/components/public/PublicPageShell";
import { Reveal } from "@/components/motion/Reveal";
import { Sparkles, Mail, MessageCircle, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        throw new Error("Failed to send message. Please try again.");
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicPageShell>
      <main className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Host Support & Inquiries</span>
            </div>
            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-5xl text-stone-900">
              We're Here for Your Celebration
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-stone-600 leading-relaxed">
              Have questions about customizing a design, corporate packages, or need assistance
              setting up your invitations? Reach out to our concierge team.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Info Column */}
          <div className="md:col-span-5 space-y-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">Email Support</h3>
                  <p className="text-xs text-stone-500">support@krishnainvites.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">WhatsApp Concierge</h3>
                  <p className="text-xs text-stone-500">+91 98765 43210 (Mon-Sat, 9am - 8pm IST)</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900">Turnaround Time</h3>
                  <p className="text-xs text-stone-500">We respond to all requests within 2 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-8 shadow-sm">
              {sent ? (
                <div className="py-12 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                  <h3 className="mt-4 font-serif text-2xl font-bold text-stone-900">
                    Message Received!
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-stone-600 max-w-sm mx-auto">
                    Thank you for reaching out. Our celebration concierge team will reply to your
                    email shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setName("");
                      setEmail("");
                      setMessage("");
                    }}
                    className="mt-6 rounded-full border border-stone-300 px-5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={submit}>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Name
                    </label>
                    <input
                      required
                      placeholder="e.g. Radhika Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="radhika@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      How Can We Help?
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your celebration, date, or any specific requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:border-rose-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-600"
                    />
                  </div>

                  {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}

                  <button
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all disabled:opacity-50"
                  >
                    <span>{loading ? "Sending..." : "Send Message"}</span>
                    {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </PublicPageShell>
  );
}

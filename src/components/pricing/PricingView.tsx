"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, HelpCircle, ArrowRight, ShieldCheck, Heart } from "lucide-react";

type TemplateItem = {
  id: string;
  name: string;
  slug: string;
  pricing: { duration_days: number; price: number }[];
};

type PlanItem = {
  id: string;
  name: string;
  type: string;
  price: number;
  billing_period: string;
  max_members: number | null;
  max_invitations: number | null;
  features: string[];
};

const FAQ_ITEMS = [
  {
    q: "Which celebrations and events are supported?",
    a: "Every celebration is supported: Weddings, Engagements, Sangeet, Haldi, Mehndi, Reception, Gruh Vastu (Housewarming), Baby Showers (Godh Bharai / Seemantham), 1st Birthdays, Anniversaries, Poojas, Cultural Festivals, and Corporate Galas.",
  },
  {
    q: "Which languages can I use for the invitation?",
    a: "We support over 14 languages including English, Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada, Malayalam, Bengali, Punjabi, Urdu, Spanish, French, and Arabic. You can type names and descriptions in any language.",
  },
  {
    q: "How does the WhatsApp RSVP tracking work?",
    a: "Your invitation includes a smart RSVP button. When guests respond, their answers (attending, headcount, dietary choices, wishes) are logged in real time into your personal host portal.",
  },
  {
    q: "Can I add our own music and venue directions?",
    a: "Yes! You can choose from our curated library of celebratory shehnai and sitar tunes or upload your custom song. Venue locations connect directly to Google Maps for 1-tap navigation.",
  },
  {
    q: "What happens when my plan expires?",
    a: "Guests can view your invitation for the full duration you choose (e.g. 30, 90, or 365 days). You will receive an export of all guest RSVPs, photos, and messages before expiry.",
  },
];

export function PricingView({
  templates,
  plans,
}: {
  templates: TemplateItem[];
  plans: PlanItem[];
}) {
  const [billingTab, setBillingTab] = useState<"individual" | "company">("individual");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const companyPlans = plans.filter((p) => p.type === "COMPANY");

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex rounded-full bg-stone-100 p-1.5 border border-stone-200">
          <button
            onClick={() => setBillingTab("individual")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              billingTab === "individual"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Individual Celebrations (Pay Once)
          </button>
          <button
            onClick={() => setBillingTab("company")}
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              billingTab === "company"
                ? "bg-white text-rose-700 shadow-sm"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Event Planners & Agencies
          </button>
        </div>
      </div>

      {/* Individual Pricing */}
      {billingTab === "individual" && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              One-Time Payment Per Celebration
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              No recurring fees. Pay once and keep your invitation active as long as you need.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto">
            {templates.map((t, idx) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 shadow-sm transition-all ${
                  idx === 0
                    ? "border-amber-300/80 bg-gradient-to-b from-white to-amber-50/30 shadow-md ring-1 ring-amber-400/30"
                    : "border-stone-200/80 bg-white"
                }`}
              >
                {idx === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-stone-900">{t.name}</h3>
                    <Sparkles className="h-5 w-5 text-amber-500" />
                  </div>
                  <p className="mt-1 text-xs text-stone-500">
                    Includes WhatsApp delivery, musical ambiance, Google Maps, and RSVP portal.
                  </p>

                  <div className="mt-6 border-t border-stone-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      Duration Tiers
                    </h4>
                    <div className="mt-3 space-y-2.5">
                      {t.pricing.map((p) => (
                        <div
                          key={p.duration_days}
                          className="flex items-center justify-between rounded-xl bg-stone-50/80 px-3.5 py-2.5 text-xs border border-stone-200/60"
                        >
                          <span className="font-medium text-stone-700">
                            {p.duration_days} Days Active Hosting
                          </span>
                          <span className="font-serif font-bold text-base text-rose-700">
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Unlimited WhatsApp Invites</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Real-time RSVP & Headcount Tracker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Google Maps Venue Directions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Multi-language (14+ Languages)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/dashboard/create?template=${t.slug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-3 text-xs font-bold text-white shadow-md shadow-rose-900/15 hover:brightness-105 transition-all"
                  >
                    <span>Create with {t.name}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Company / Planner Pricing */}
      {billingTab === "company" && (
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              For Wedding Planners, Decorators & Studios
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              Manage multi-client invitations under your brand with custom domains and analytics.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {companyPlans.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm hover:border-amber-300 transition-all"
              >
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-900">{p.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-serif text-3xl font-bold text-stone-900">
                      ₹{p.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-500">
                      / {p.billing_period.toLowerCase()}
                    </span>
                  </div>

                  <div className="mt-6 space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Team Members: {p.max_members ?? "Unlimited"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span>Client Invitations: {p.max_invitations ?? "Unlimited"}</span>
                    </div>
                    {Array.isArray(p.features) &&
                      p.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-emerald-600" />
                          <span>{f}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/company"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-xs font-bold text-white hover:bg-stone-800 transition-colors"
                  >
                    <span>Subscribe as Planner</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Accordion */}
      <section className="mt-20 max-w-3xl mx-auto">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-700">Have Questions?</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-stone-900">Frequently Asked Questions</h2>
        </div>

        <div className="mt-8 space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-semibold text-stone-900 hover:bg-stone-50 transition-colors"
                >
                  <span>{item.q}</span>
                  <span
                    className={`ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-transform ${
                      isOpen ? "rotate-180 bg-rose-100 text-rose-700" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-stone-100 px-4 pb-4 pt-2 text-xs leading-relaxed text-stone-600"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

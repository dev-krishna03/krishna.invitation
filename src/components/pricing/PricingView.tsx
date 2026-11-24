"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, HelpCircle, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { ConciergeBookingModal } from "@/components/concierge/ConciergeBookingModal";

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
    a: "Guests can view your invitation for the full duration you choose (e.g. 15, 30, 90, or 180 days). After expiry, the link remains read-only as a celebration keepsake and can be extended anytime.",
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
      {/* Tab Switcher - Balcony Style */}
      <div className="flex justify-center mt-6">
        <div className="inline-flex rounded-full bg-[#F5F1FE] p-1.5 border border-[#E5D9FC]">
          <button
            onClick={() => setBillingTab("individual")}
            className={`rounded-full px-6 py-2 text-xs font-semibold transition-all cursor-pointer ${
              billingTab === "individual"
                ? "bg-[#6520EE] text-white shadow-md shadow-[#6520EE]/20 font-bold"
                : "text-stone-600 hover:text-[#12042F]"
            }`}
          >
            Individual Celebrations (Pay Once)
          </button>
          <button
            onClick={() => setBillingTab("company")}
            className={`rounded-full px-6 py-2 text-xs font-semibold transition-all cursor-pointer ${
              billingTab === "company"
                ? "bg-[#6520EE] text-white shadow-md shadow-[#6520EE]/20 font-bold"
                : "text-stone-600 hover:text-[#12042F]"
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
            <h2 className="text-2xl font-bold text-[#12042F]">
              One-Time Payment Per Celebration
            </h2>
            <p className="mt-1.5 text-xs text-stone-500">
              No subscription or recurring charges. Pay once and keep your digital website invite active as long as you need.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {templates.map((t, idx) => (
              <motion.div
                key={t.id}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col justify-between rounded-3xl border p-7 shadow-sm transition-all ${
                  idx === 0
                    ? "border-[#6520EE] bg-white ring-1 ring-[#6520EE] shadow-lg shadow-[#6520EE]/10"
                    : "border-[#E5D9FC]/80 bg-white"
                }`}
              >
                {idx === 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#6520EE] px-4 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#12042F]">{t.name}</h3>
                    <Sparkles className="h-5 w-5 text-[#6520EE]" />
                  </div>
                  <p className="mt-1.5 text-xs text-stone-500 leading-relaxed">
                    Includes WhatsApp personalised guest links, background music, Google Maps, and live RSVP tracking.
                  </p>

                  <div className="mt-6 border-t border-stone-100 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#6520EE]">
                      Validity Tiers
                    </h4>
                    <div className="mt-3 space-y-2.5">
                      {t.pricing.map((p) => (
                        <div
                          key={p.duration_days}
                          className="flex items-center justify-between rounded-2xl bg-[#F5F1FE] px-4 py-3 text-xs border border-[#E5D9FC]/70"
                        >
                          <span className="font-semibold text-stone-700">
                            {p.duration_days} Days Active Hosting
                          </span>
                          <span className="font-bold text-base text-[#6520EE]">
                            ₹{p.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>WhatsApp Personalised Guest Links</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Real-time RSVP & Headcount Tracker</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Google Maps Directions & Calendar Save</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Zero guest sign-up needed</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={`/dashboard/create?template=${t.slug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6520EE] hover:bg-[#5213D2] py-3 text-xs font-bold text-white shadow-md shadow-[#6520EE]/20 hover:brightness-105 transition-all no-underline"
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
            <h2 className="text-2xl font-bold text-[#12042F]">
              For Wedding Planners, Studios & Agencies
            </h2>
            <p className="mt-1.5 text-xs text-stone-500">
              Manage unlimited client invitations with custom branding and client confirmation links.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {companyPlans.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-3xl border border-[#E5D9FC]/80 bg-white p-7 shadow-sm hover:border-[#6520EE] hover:shadow-xl transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#12042F]">{p.name}</h3>
                    <span className="rounded-full bg-[#F5F1FE] text-[#6520EE] px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-[#E5D9FC]">
                      {p.billing_period}
                    </span>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-[#12042F]">
                    ₹{p.price.toLocaleString()}
                    <span className="text-xs font-normal text-stone-400">/{p.billing_period.toLowerCase()}</span>
                  </p>

                  <ul className="mt-6 space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-4">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href="/register"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#6520EE] hover:bg-[#5213D2] py-3 text-xs font-bold text-white shadow-md shadow-[#6520EE]/20 transition-all no-underline"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Done-For-You VIP Concierge Section */}
      <div className="mt-14 max-w-4xl mx-auto">
        <ConciergeBookingModal variant="card" />
      </div>

      {/* FAQs Section */}
      <div id="faqs" className="mt-20 max-w-3xl mx-auto border-t border-[#E5D9FC]/60 pt-16">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-3 py-1 rounded-full border border-[#E5D9FC]">
            Help & FAQs
          </span>
          <h2 className="mt-3 text-2xl font-bold text-[#12042F]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-[#E5D9FC]/70 bg-white shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4.5 text-left text-xs font-bold text-[#12042F] hover:text-[#6520EE] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-base text-stone-400">{isOpen ? "−" : "+"}</span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4.5 pb-4.5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

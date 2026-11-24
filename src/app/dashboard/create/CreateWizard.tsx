"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, Clock, Users, ArrowRight, ShieldCheck } from "lucide-react";

type Template = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnail_url?: string | null;
  preview_url?: string | null;
  event_types: string[];
  pricing: { duration_days: number; price: number; currency: string }[];
};

type EventType = { slug: string; name: string; icon: string | null };

const steps = ["Template", "Duration & Plans", "Custom Details", "Order Review"];

export function CreateWizard({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<Template | null>(null);
  const [selectedPlanDays, setSelectedPlanDays] = useState<number>(30);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [data, setData] = useState<Record<string, any>>({});
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  // Add-ons
  const [addOnExtraLinks, setAddOnExtraLinks] = useState(false); // +50 links for ₹399
  const [addOnRemoveBranding, setAddOnRemoveBranding] = useState(false); // ₹299
  const [addOnEventBundle, setAddOnEventBundle] = useState(false); // 4-Stage Suite for ₹799
  const [addOnConcierge, setAddOnConcierge] = useState(false); // Done-for-you concierge ₹999

  useEffect(() => {
    fetch("/api/event-types")
      .then((r) => r.json())
      .then((d: { eventTypes: EventType[] }) => setEventTypes(d.eventTypes))
      .catch(() => {});
  }, []);

  // Compute Base Price and Pay-by-Days tiers for selected template
  const basePrice = useMemo(() => {
    if (!template) return 1000;
    const lowest = template.pricing?.[0]?.price;
    return lowest || 1000;
  }, [template]);

  const planTiers = useMemo(() => {
    return [
      {
        plan: "Basic",
        days: 15,
        mult: "×1.0",
        price: basePrice,
        updates: "1 Live Update",
        links: "5 Personal Links",
      },
      {
        plan: "Standard",
        days: 30,
        mult: "×1.5",
        price: Math.round(basePrice * 1.5),
        updates: "3 Live Updates",
        links: "25 Personal Links",
        highlight: true,
      },
      {
        plan: "Premium",
        days: 90,
        mult: "×2.5",
        price: Math.round(basePrice * 2.5),
        updates: "10 Live Updates",
        links: "100 Personal Links",
      },
      {
        plan: "Extended",
        days: 180,
        mult: "×3.5",
        price: Math.round(basePrice * 3.5),
        updates: "Unlimited Updates",
        links: "Unlimited Links",
      },
    ];
  }, [basePrice]);

  const selectedTier = useMemo(() => {
    return planTiers.find((t) => t.days === selectedPlanDays) || planTiers[1];
  }, [planTiers, selectedPlanDays]);

  // Order Calculation Sequence (from blueprint)
  const templatePrice = selectedTier.price;
  const addOnsTotal =
    (addOnExtraLinks ? 399 : 0) +
    (addOnRemoveBranding ? 299 : 0) +
    (addOnEventBundle ? 799 : 0) +
    (addOnConcierge ? 999 : 0);
  const subtotalBeforeGst = Math.max(0, templatePrice - discount + addOnsTotal);
  const gst = Math.round(subtotalBeforeGst * 0.18);
  const totalHostPays = subtotalBeforeGst + gst;

  // Split calculations (90% creator, 10% platform fee on template price)
  const netTemplatePrice = Math.max(0, templatePrice - discount);
  const creatorEarns = Math.round(netTemplatePrice * 0.9);
  const platformFee = netTemplatePrice - creatorEarns;

  async function applyCoupon() {
    if (!coupon) return;
    const res = await fetch("/api/payments/apply-coupon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: coupon, amount: templatePrice }),
    });
    const d = (await res.json()) as { valid: boolean; discount?: number; reason?: string };
    if (!d.valid) {
      setDiscount(0);
      setError(d.reason ?? "Invalid code");
    } else {
      setDiscount(d.discount ?? 0);
      setError(null);
    }
  }

  async function pay() {
    if (!template) return;
    setError(null);

    const fullData = {
      ...data,
      planDays: selectedPlanDays,
      addOnExtraLinks,
      addOnRemoveBranding,
      addOnEventBundle,
      addOnConcierge,
    };

    const create = await fetch("/api/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateId: template.id,
        title,
        eventType,
        data: fullData,
      }),
    });

    if (!create.ok) return setError("Failed to create invitation");
    const { invitation } = (await create.json()) as { invitation: { id: string } };

    // Update expires_at and bundle flags on server according to pay-by-days plan
    const expiryDate = new Date(Date.now() + selectedPlanDays * 24 * 60 * 60 * 1000);
    await fetch(`/api/invitations/${invitation.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        expires_at: expiryDate,
        is_published: true,
        bundle_enabled: addOnEventBundle,
        bundle_type: addOnEventBundle ? "FULL_SUITE" : undefined,
      }),
    });

    // If concierge service selected, trigger concierge request creation
    if (addOnConcierge) {
      await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invitationId: invitation.id,
          amount: 999,
          notes: "Concierge setup requested at checkout.",
        }),
      }).catch(() => {});
    }

    const order = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        amount: totalHostPays,
        currency: "INR",
        invitationId: invitation.id,
        couponCode: coupon || undefined,
      }),
    });

    if (!order.ok) {
      const d = (await order.json().catch(() => ({}))) as { error?: string };
      return setError(d.error ?? "Payment failed to start");
    }

    router.push(`/dashboard/invitations/${invitation.id}`);
  }

  const slide = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

  return (
    <div className="mt-6">
      {/* Steps Rail */}
      <ol className="flex items-center gap-2 text-xs">
        {steps.map((s, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <li key={s} className="flex items-center gap-2">
              <motion.span
                animate={{
                  backgroundColor: done ? "#12042F" : active ? "#6520EE" : "#EDE8F5",
                  color: done || active ? "#fff" : "#7A7387",
                }}
                className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold"
              >
                {done ? "✓" : idx}
              </motion.span>
              <span className={active ? "font-semibold text-[#12042F]" : "text-[#7A7387]"}>{s}</span>
              {i < steps.length - 1 && <span className="mx-1 text-[#E5D9FC]">—</span>}
            </li>
          );
        })}
      </ol>

      <div className="relative mt-8 min-h-[320px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT TEMPLATE */}
          {step === 1 && (
            <motion.div key="step1" {...slide}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => {
                      setTemplate(t);
                      setStep(2);
                    }}
                    whileHover={{ y: -3, boxShadow: "0 12px 30px -10px rgba(101,32,238,0.12)" }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-3xl border border-[#E5D9FC] bg-white p-5 text-left transition-all hover:border-[#6520EE] cursor-pointer group"
                  >
                    {t.thumbnail_url && (
                      <div className="mb-3 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100 border border-stone-100">
                        <img
                          src={t.thumbnail_url}
                          alt={t.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-[#12042F] group-hover:text-[#6520EE] transition-colors">{t.name}</p>
                      <Sparkles className="h-4 w-4 text-[#6520EE]" />
                    </div>
                    <p className="mt-1 text-xs text-[#64748B] line-clamp-2">
                      {t.description ?? "Elegant digital invitation with audio & WhatsApp RSVPs."}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#F5F1FE]">
                      <span className="text-xs font-bold text-[#6520EE]">
                        From ₹{(t.pricing?.[0]?.price || 1000).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-[#7A7387] font-medium">15 to 180 Days</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: PAY-BY-DAYS PRICING */}
          {step === 2 && template && (
            <motion.div key="step2" {...slide} className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#12042F]">
                  Select Validity Duration for {template.name}
                </h3>
                <p className="text-xs text-[#64748B] mt-1">
                  How long should your digital card stay online for guests? You can extend anytime later.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {planTiers.map((tier) => (
                  <motion.button
                    key={tier.days}
                    onClick={() => setSelectedPlanDays(tier.days)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-3xl border p-5 text-left transition-all cursor-pointer ${
                      selectedPlanDays === tier.days
                        ? "border-[#6520EE] bg-[#F5F1FE]/60 shadow-xs ring-1 ring-[#6520EE]"
                        : "border-[#E5D9FC] bg-white hover:border-[#6520EE]/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[#12042F]">
                        {tier.plan} ({tier.days} Days)
                      </p>
                      {tier.highlight && (
                        <span className="rounded-full bg-[#6520EE] text-white px-2.5 py-0.5 text-[10px] font-semibold tracking-wide">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-bold text-[#12042F]">
                      ₹{tier.price.toLocaleString()}
                    </p>
                    <span className="text-[11px] font-medium text-[#7A7387]">{tier.mult} Base Price</span>

                    <ul className="mt-4 space-y-1.5 text-xs text-[#5B556B]">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-[#6520EE]" />
                        <span>{tier.updates}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-[#6520EE]" />
                        <span>{tier.links}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-[#6520EE]" />
                        <span>WhatsApp Delivery Ready</span>
                      </li>
                    </ul>
                  </motion.button>
                ))}
              </div>

              {/* Add-ons Checklist */}
              <div className="rounded-3xl border border-[#E5D9FC] bg-white p-5 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#12042F] block">
                  Optional Add-ons
                </span>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] hover:bg-[#F5F1FE]/50 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOnExtraLinks}
                      onChange={(e) => setAddOnExtraLinks(e.target.checked)}
                      className="accent-[#6520EE] h-4 w-4 rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#12042F] block">+50 Extra Personalized Links</span>
                      <span className="text-[11px] text-[#64748B]">Send unique name links to 50 more guests</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#12042F]">+₹399</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] hover:bg-[#F5F1FE]/50 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOnRemoveBranding}
                      onChange={(e) => setAddOnRemoveBranding(e.target.checked)}
                      className="accent-[#6520EE] h-4 w-4 rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#12042F] block">White Label (Remove Branding)</span>
                      <span className="text-[11px] text-[#64748B]">Hide &ldquo;Powered by Krishna Invitations&rdquo; footer</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#12042F]">+₹299</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] hover:bg-[#F5F1FE]/50 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOnEventBundle}
                      onChange={(e) => setAddOnEventBundle(e.target.checked)}
                      className="accent-[#6520EE] h-4 w-4 rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#12042F] block">4-Stage Occasion Event Bundle</span>
                      <span className="text-[11px] text-[#64748B]">Includes Save-the-Date, Main Invite, Reminders &amp; Thank-You Card</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#12042F]">+₹799</span>
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] hover:bg-[#F5F1FE]/50 transition-colors cursor-pointer text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={addOnConcierge}
                      onChange={(e) => setAddOnConcierge(e.target.checked)}
                      className="accent-[#6520EE] h-4 w-4 rounded"
                    />
                    <div>
                      <span className="font-semibold text-[#12042F] block">Done-For-You Concierge Styling</span>
                      <span className="text-[11px] text-[#64748B]">Our wedding designers format your fonts, details &amp; test WhatsApp delivery</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#12042F]">+₹999</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="rounded-full border border-[#E5D9FC] bg-white px-5 py-2.5 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
                >
                  Back
                </button>
                <motion.button
                  onClick={() => setStep(3)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-[#6520EE] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5213D2] cursor-pointer"
                >
                  Continue to Details
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOM DETAILS */}
          {step === 3 && (
            <motion.div key="step3" {...slide} className="max-w-lg space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#12042F]">Invitation Information</h3>
                <p className="text-xs text-[#64748B]">
                  Fill in your main names and date. You can edit all details anytime after publishing.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                  Invitation Title *
                </label>
                <input
                  placeholder="e.g. Aarav & Priya's Royal Wedding"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                  Occasion Type
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE] font-semibold"
                >
                  {eventTypes.length > 0 ? (
                    eventTypes.map((v) => (
                      <option key={v.slug} value={v.slug}>
                        {v.icon ? `${v.icon} ` : ""}{v.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="wedding">💍 Wedding &amp; Pheras</option>
                      <option value="engagement">💍 Engagement &amp; Roka</option>
                      <option value="birthday">🎂 Birthday Party</option>
                      <option value="housewarming">🏡 Griha Pravesh</option>
                      <option value="anniversary">🥂 Anniversary</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                    Primary Name
                  </label>
                  <input
                    placeholder="e.g. Aarav Mehta"
                    value={data.primaryName || ""}
                    onChange={(e) => setData({ ...data, primaryName: e.target.value })}
                    className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                    Secondary Name
                  </label>
                  <input
                    placeholder="e.g. Priya Sharma"
                    value={data.secondaryName || ""}
                    onChange={(e) => setData({ ...data, secondaryName: e.target.value })}
                    className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                  Event Date
                </label>
                <input
                  placeholder="e.g. 12 December 2026"
                  value={data.eventDate || ""}
                  onChange={(e) => setData({ ...data, eventDate: e.target.value })}
                  className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#12042F] mb-1">
                  Venue Name &amp; City
                </label>
                <input
                  placeholder="e.g. The Imperial Palace, Udaipur"
                  value={data.venueName || ""}
                  onChange={(e) => setData({ ...data, venueName: e.target.value })}
                  className="w-full rounded-2xl border border-[#E5D9FC] bg-white p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE] focus:ring-1 focus:ring-[#6520EE]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="rounded-full border border-[#E5D9FC] bg-white px-5 py-2.5 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
                >
                  Back
                </button>
                <motion.button
                  onClick={() => setStep(4)}
                  disabled={!title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-full bg-[#6520EE] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5213D2] disabled:opacity-50 cursor-pointer"
                >
                  Review Order &amp; Pay
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ORDER CALCULATION & PAYMENT */}
          {step === 4 && (
            <motion.div key="step4" {...slide} className="max-w-lg space-y-4">
              <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6520EE] block">
                  Order Breakdown
                </span>

                <div className="space-y-2 text-xs divide-y divide-[#F5F1FE]">
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[#12042F]">
                      {template?.name} ({selectedTier.plan} • {selectedTier.days} Days)
                    </span>
                    <span className="font-semibold text-[#12042F]">₹{templatePrice.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center pt-2 text-emerald-600">
                      <span>Promo Coupon Discount</span>
                      <span className="font-semibold">-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  {addOnExtraLinks && (
                    <div className="flex justify-between items-center pt-2 text-[#12042F]">
                      <span>+50 Extra Personalized Links</span>
                      <span className="font-semibold text-[#12042F]">+₹399</span>
                    </div>
                  )}

                  {addOnRemoveBranding && (
                    <div className="flex justify-between items-center pt-2 text-[#12042F]">
                      <span>White Label (Remove Branding)</span>
                      <span className="font-semibold text-[#12042F]">+₹299</span>
                    </div>
                  )}

                  {addOnEventBundle && (
                    <div className="flex justify-between items-center pt-2 text-[#12042F]">
                      <span>4-Stage Event Bundle Suite</span>
                      <span className="font-semibold text-[#12042F]">+₹799</span>
                    </div>
                  )}

                  {addOnConcierge && (
                    <div className="flex justify-between items-center pt-2 text-[#12042F]">
                      <span>Done-For-You Concierge Styling</span>
                      <span className="font-semibold text-[#12042F]">+₹999</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 text-[#64748B] text-[11px]">
                    <span>GST (18% estimated)</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-[#12042F] font-bold text-sm text-[#12042F]">
                    <span>Total Host Pays</span>
                    <span className="text-xl font-bold text-[#6520EE]">₹{totalHostPays.toLocaleString()}</span>
                  </div>
                </div>

                {/* Marketplace Split Transparency */}
                <div className="mt-4 rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-3.5 text-[11px] text-[#12042F] space-y-1">
                  <div className="flex justify-between">
                    <span>Creator Royalties (90%):</span>
                    <span className="font-bold text-[#6520EE]">₹{creatorEarns.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B]">
                    <span>Platform Fee (10%):</span>
                    <span>₹{platformFee.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Row */}
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 rounded-full border border-[#E5D9FC] bg-white px-4 py-2.5 text-xs uppercase font-mono focus:border-[#6520EE] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-full border border-[#E5D9FC] bg-white px-5 py-2.5 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {error && (
                <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="rounded-full border border-[#E5D9FC] bg-white px-5 py-2.5 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
                >
                  Back
                </button>
                <motion.button
                  onClick={pay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex-1 rounded-full bg-[#6520EE] py-3 text-xs font-semibold text-white shadow-md shadow-[#6520EE]/20 hover:bg-[#5213D2] cursor-pointer"
                >
                  Pay &amp; Publish Invitation
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

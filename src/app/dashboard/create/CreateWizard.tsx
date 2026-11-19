"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

type Template = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  event_types: string[];
  pricing: { duration_days: number; price: number; currency: string }[];
};

type EventType = { slug: string; name: string; icon: string | null };

const steps = ["Template", "Duration", "Details", "Review"];

export function CreateWizard({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<Template | null>(null);
  const [tier, setTier] = useState<Template["pricing"][number] | null>(null);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("wedding");
  const [data, setData] = useState<Record<string, string>>({});
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() => {
    fetch("/api/event-types")
      .then((r) => r.json())
      .then((d: { eventTypes: EventType[] }) => setEventTypes(d.eventTypes))
      .catch(() => {});
  }, []);

  const total = useMemo(() => Math.max(0, (tier?.price ?? 0) - discount), [tier, discount]);

  async function applyCoupon() {
    if (!coupon || !tier) return;
    const res = await fetch("/api/payments/apply-coupon", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: coupon, amount: tier.price }),
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
    if (!template || !tier) return;
    setError(null);
    const create = await fetch("/api/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateId: template.id, title, eventType, data }),
    });
    if (!create.ok) return setError("Failed to create invitation");
    const { invitation } = (await create.json()) as { invitation: { id: string } };
    const order = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ amount: total, currency: tier.currency, invitationId: invitation.id, couponCode: coupon || undefined }),
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
      <ol className="flex items-center gap-2 text-xs">
        {steps.map((s, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <li key={s} className="flex items-center gap-2">
              <motion.span
                animate={{
                  backgroundColor: done ? "#000" : active ? "#111" : "#e5e7eb",
                  color: done || active ? "#fff" : "#6b7280",
                }}
                className="grid h-6 w-6 place-items-center rounded-full text-[11px]"
              >
                {done ? "✓" : idx}
              </motion.span>
              <span className={active ? "font-semibold" : "text-gray-500"}>{s}</span>
              {i < steps.length - 1 && <span className="mx-1 text-gray-300">—</span>}
            </li>
          );
        })}
      </ol>

      <div className="relative mt-8 min-h-[280px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" {...slide}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => (
                  <motion.button
                    key={t.id}
                    onClick={() => { setTemplate(t); setTier(t.pricing[0] ?? null); setStep(2); }}
                    whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-xl border bg-white p-4 text-left"
                  >
                    <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-200" />
                    <h3 className="mt-3 font-semibold">{t.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">{t.event_types.join(", ")}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {step === 2 && template && (
            <motion.div key="step2" {...slide}>
              <div className="grid gap-3 sm:grid-cols-3">
                {template.pricing.map((p) => (
                  <motion.button
                    key={p.duration_days}
                    onClick={() => setTier(p)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{ borderColor: tier?.duration_days === p.duration_days ? "#000" : "#e5e7eb" }}
                    className="rounded-xl border-2 p-4 text-left"
                  >
                    <p className="font-semibold">{p.duration_days} days</p>
                    <p className="mt-2 text-xl">
                      {p.currency === "INR" ? "₹" : p.currency}
                      {p.price.toLocaleString()}
                    </p>
                  </motion.button>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button onClick={() => setStep(1)} className="rounded-md border px-4 py-2">Back</button>
                <motion.button
                  onClick={() => setStep(3)}
                  disabled={!tier}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="step3" {...slide} className="max-w-lg space-y-3">
              <input
                placeholder="Title (e.g. Priya + Aarav)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full rounded-md border px-3 py-2"
              >
                {eventTypes.map((v) => (
                  <option key={v.slug} value={v.slug}>
                    {v.icon ? `${v.icon} ` : ""}{v.name}
                  </option>
                ))}
              </select>
              <input placeholder="Primary Name" onChange={(e) => setData({ ...data, primaryName: e.target.value })} className="w-full rounded-md border px-3 py-2" />
              <input placeholder="Secondary Name" onChange={(e) => setData({ ...data, secondaryName: e.target.value })} className="w-full rounded-md border px-3 py-2" />
              <textarea placeholder="Welcome Message" onChange={(e) => setData({ ...data, message: e.target.value })} className="w-full rounded-md border px-3 py-2" />
              <div className="flex gap-2">
                <button onClick={() => setStep(2)} className="rounded-md border px-4 py-2">Back</button>
                <motion.button
                  onClick={() => setStep(4)}
                  disabled={!title}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
                >
                  Continue
                </motion.button>
              </div>
            </motion.div>
          )}
          {step === 4 && (
            <motion.div key="step4" {...slide} className="max-w-lg">
              <div className="rounded-xl border p-4">
                <p className="text-sm">Template: {template?.name}</p>
                <p className="text-sm">Duration: {tier?.duration_days} days</p>
                <motion.p
                  key={total}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-lg"
                >
                  Total: ₹{total.toLocaleString()}
                </motion.p>
              </div>
              <div className="mt-4 flex gap-2">
                <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} className="flex-1 rounded-md border px-3 py-2" />
                <motion.button onClick={applyCoupon} whileTap={{ scale: 0.97 }} className="rounded-md border px-4">
                  Apply
                </motion.button>
              </div>
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm text-red-600">
                  {error}
                </motion.p>
              )}
              <div className="mt-6 flex gap-2">
                <button onClick={() => setStep(3)} className="rounded-md border px-4 py-2">Back</button>
                <motion.button
                  onClick={pay}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-md bg-black px-4 py-2 text-white"
                >
                  Pay &amp; Publish
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

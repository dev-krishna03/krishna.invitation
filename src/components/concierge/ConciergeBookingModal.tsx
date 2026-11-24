"use client";

import { useState } from "react";
import {
  Sparkles,
  Wand2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  MessageCircle,
  CreditCard,
  RefreshCw,
  Heart,
} from "lucide-react";

export function ConciergeBookingModal({
  buttonClassName,
  buttonText = "Let Our Team Design It (₹999)",
  variant = "pill",
}: {
  buttonClassName?: string;
  buttonText?: string;
  variant?: "pill" | "card" | "outline";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [names, setNames] = useState("");
  const [occasion, setOccasion] = useState("Wedding");
  const [whatsapp, setWhatsapp] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fullNotes = [
      `Couple/Host Names: ${names}`,
      `Occasion: ${occasion}`,
      `WhatsApp Phone: ${whatsapp}`,
      `Date & Venue: ${eventDate || "TBD"} at ${venue || "TBD"}`,
      notes ? `Instructions: ${notes}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: 999,
          notes: fullNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit concierge request");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        setNames("");
        setWhatsapp("");
        setVenue("");
        setNotes("");
      }, 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error booking service");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {variant === "card" ? (
        <div className="rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-xs">
              <Wand2 className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-800 bg-violet-100 px-2 py-0.5 rounded-full">
                VIP Concierge Service
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 mt-1">
                Too Busy to Fill Details? Let Our Team Design It
              </h3>
            </div>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            Send us your wedding/event card photos on WhatsApp. Our in-house design artists will type the details, crop high-resolution photos, add Google Maps navigation, set celebratory soundtrack, and deliver your live invitation ready to send within 24 hours.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-violet-100">
            <span className="font-serif text-lg font-bold text-violet-950">
              ₹999 <span className="text-xs font-normal text-stone-500">flat fee</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Book Concierge Service</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={
            buttonClassName ||
            "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-800 hover:from-violet-800 hover:to-purple-900 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
          }
        >
          <Wand2 className="h-3.5 w-3.5 text-violet-200" />
          <span>{buttonText}</span>
        </button>
      )}

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 sm:p-8 shadow-2xl space-y-5 text-stone-900 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-700 text-white shadow-xs">
                  <Wand2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Done-For-You VIP Concierge
                  </h3>
                  <p className="text-xs text-stone-500">Our artists design and configure your invitation within 24 hours.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h4 className="font-serif text-base font-bold text-emerald-900">Concierge Booking Received!</h4>
                <p className="text-xs text-emerald-700">
                  Our lead designer will reach out on your WhatsApp ({whatsapp}) within 2 hours to confirm your draft details.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-4">
                {error && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5 space-y-1.5 text-xs text-violet-950">
                  <span className="font-bold block flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-700" />
                    What&apos;s Included (Flat ₹999)
                  </span>
                  <ul className="list-disc list-inside text-[11px] text-stone-600 space-y-0.5">
                    <li>Full card typesetting & Gujarati / Devanagari typography</li>
                    <li>Google Maps directions setup for all event venues</li>
                    <li>Background music matching & Photo crop optimization</li>
                    <li>Delivered ready to share on WhatsApp in 24 hours</li>
                  </ul>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Host / Couple Names *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Mehta & Priya Sharma"
                    value={names}
                    onChange={(e) => setNames(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Occasion
                    </label>
                    <select
                      value={occasion}
                      onChange={(e) => setOccasion(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Reception">Reception</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Baby Shower">Baby Shower</option>
                      <option value="Housewarming">Housewarming</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      WhatsApp Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      Event Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                      City / Venue (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Udaipur, Rajasthan"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                    Special Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. We have 4 ceremonies (Haldi, Mehendi, Sangeet, Wedding). We need Jain meal options on RSVP."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  />
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Total Service Fee</span>
                    <span className="font-serif text-lg font-bold text-violet-950">₹999</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-violet-700 hover:bg-violet-800 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {submitting ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Wand2 className="h-3.5 w-3.5" />
                      )}
                      <span>Confirm Booking (₹999)</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

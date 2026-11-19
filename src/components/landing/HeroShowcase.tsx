"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  VolumeX,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  Heart,
  Share2,
  Clock,
} from "lucide-react";

export function HeroShowcase() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [rsvpCount, setRsvpCount] = useState(248);
  const [hasRsvpd, setHasRsvpd] = useState(false);

  const handleRsvp = () => {
    if (!hasRsvpd) {
      setRsvpCount((prev) => prev + 1);
      setHasRsvpd(true);
    }
  };

  return (
    <div className="relative mx-auto mt-14 max-w-4xl px-4">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 -top-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/15 to-amber-500/10 blur-2xl -z-10" />

      {/* Main Showcase Container */}
      <div className="relative rounded-3xl border border-stone-200/90 bg-white/90 p-3 shadow-2xl shadow-rose-950/10 backdrop-blur-md md:p-6">
        {/* Browser / Device Chrome top bar */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 px-2">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex items-center gap-2 rounded-full bg-stone-100/90 px-3 py-1 text-[11px] font-medium text-stone-600">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>invite.krishnainvites.com/aarav-meera</span>
          </div>
          <div className="text-[11px] text-stone-400 font-mono hidden sm:block">Live Interactive Preview</div>
        </div>

        {/* Card Content Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Visual Invite Card Mockup */}
          <div className="md:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-amber-300/60 bg-gradient-to-b from-[#FFFDF9] via-[#FFF9F2] to-[#FFF4EC] p-6 text-center shadow-lg">
              {/* Corner Ornamental Flourishes */}
              <div className="absolute top-2 left-2 text-amber-600/40 text-xs select-none">✦</div>
              <div className="absolute top-2 right-2 text-amber-600/40 text-xs select-none">✦</div>
              <div className="absolute bottom-2 left-2 text-amber-600/40 text-xs select-none">✦</div>
              <div className="absolute bottom-2 right-2 text-amber-600/40 text-xs select-none">✦</div>

              {/* Auspicious Ganesh / Blessing motif */}
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 shadow-inner">
                <span className="font-serif text-sm font-bold">॥ श्री ॥</span>
              </div>

              <p className="mt-3 text-[11px] uppercase tracking-[0.25em] text-amber-800 font-semibold">
                Together with their families
              </p>

              <h3 className="mt-2 font-serif text-2xl font-bold tracking-tight text-stone-900 md:text-3xl">
                Aarav & Meera
              </h3>

              <p className="mt-1 text-xs text-rose-700 font-medium italic">
                Request the pleasure of your gracious presence
              </p>

              {/* Event Details Grid */}
              <div className="mt-5 rounded-xl border border-amber-200/60 bg-white/70 p-3 text-xs text-stone-700">
                <div className="flex items-center justify-center gap-4 divide-x divide-stone-200">
                  <div className="flex items-center gap-1.5 px-2">
                    <Calendar className="h-3.5 w-3.5 text-rose-600" />
                    <span className="font-medium">Nov 28, 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <span>7:00 PM onwards</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-stone-600">
                  <MapPin className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">The Leela Palace, Udaipur, Rajasthan</span>
                </div>
              </div>

              {/* Interactive Audio Player Simulation */}
              <div className="mt-4 flex items-center justify-between rounded-full bg-rose-50/80 px-3.5 py-1.5 border border-rose-200/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm"
                    aria-label="Toggle audio"
                  >
                    {isPlaying ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                  </button>
                  <span className="text-[11px] font-medium text-rose-900">
                    Kudmayi • Sitar & Acoustic
                  </span>
                </div>
                {/* Equalizer animation */}
                <div className="flex items-center gap-0.5 h-3">
                  {[40, 80, 50, 100, 60, 90, 40].map((height, i) => (
                    <motion.span
                      key={i}
                      className="w-0.5 rounded-full bg-rose-500"
                      animate={isPlaying ? { height: ["20%", `${height}%`, "30%"] } : { height: "20%" }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "easeInOut",
                      }}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive RSVP Mockup */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleRsvp}
                  className={`flex-1 rounded-xl py-2.5 px-3 text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    hasRsvpd
                      ? "bg-emerald-600 text-white"
                      : "bg-gradient-to-r from-rose-600 to-amber-600 text-white hover:brightness-105"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{hasRsvpd ? "RSVP Confirmed ✓" : "Confirm My Presence"}</span>
                </button>
                <button
                  className="rounded-xl border border-stone-200 bg-white p-2.5 text-stone-700 hover:bg-stone-50"
                  aria-label="Share"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Highlights & Metrics */}
          <div className="md:col-span-5 space-y-3.5 text-left">
            <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white to-amber-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Real-Time RSVP Tracker</h4>
                  <p className="text-[11px] text-stone-500">Instant updates right into your dashboard</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-medium border-t border-stone-100 pt-2 text-stone-600">
                <span>Confirmed Guests:</span>
                <span className="font-bold text-rose-700">{rsvpCount} Attending</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white to-rose-50/50 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Google Maps Direction</h4>
                  <p className="text-[11px] text-stone-500">1-tap navigation for your guests</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-stone-600 italic">
                Guests never get lost with integrated Uber / Google Maps pinpoints.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200/70 bg-gradient-to-br from-white to-stone-50 p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <Heart className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold text-stone-900">Multi-Day Celebration Timeline</h4>
                  <p className="text-[11px] text-stone-500">Haldi, Mehndi, Sangeet & Reception</p>
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1">
                {["Haldi", "Mehndi", "Sangeet", "Pheras", "Reception"].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

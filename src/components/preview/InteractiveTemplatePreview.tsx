"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  Edit3,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  MapPin,
  Calendar,
  Clock,
  Heart,
  CheckCircle2,
  Share2,
} from "lucide-react";

type Props = {
  slug: string;
  templateName: string;
  songUrl?: string;
  previewData?: Record<string, unknown>;
};

// Falling petal particle
type Petal = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
};

export function InteractiveTemplatePreview({
  slug,
  templateName,
  songUrl = "/audio/presets/shehnai-wedding.wav",
  previewData = {},
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const [hasRsvpd, setHasRsvpd] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate petals
  useEffect(() => {
    const list: Petal[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 6,
      size: 14 + Math.random() * 14,
      rotate: Math.random() * 360,
    }));
    setPetals(list);
  }, []);

  function triggerPetalShower() {
    // Add extra burst of petals
    const burst: Petal[] = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
      duration: 4 + Math.random() * 4,
      size: 16 + Math.random() * 12,
      rotate: Math.random() * 360,
    }));
    setPetals((prev) => [...prev, ...burst]);
  }

  function handleTapToOpen() {
    setIsOpen(true);
    triggerPetalShower();
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  function toggleAudio() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }

  const primaryName = (previewData.primaryName as string) ?? "Aarav Mehta";
  const secondaryName = (previewData.secondaryName as string) ?? "Priya Sharma";

  return (
    <div className="relative min-h-screen select-none font-sans overflow-x-hidden bg-[#FAF6F0]">
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        src={songUrl}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Floating Falling Petals Animation */}
      <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
        {petals.map((p) => (
          <motion.div
            key={p.id}
            initial={{ y: -40, x: `${p.x}vw`, opacity: 0, rotate: 0 }}
            animate={{
              y: "105vh",
              x: [`${p.x}vw`, `${p.x + (Math.random() * 10 - 5)}vw`, `${p.x}vw`],
              opacity: [0, 0.85, 0.85, 0],
              rotate: p.rotate + 360,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ width: p.size, height: p.size }}
            className="absolute text-rose-300/80 drop-shadow-sm select-none"
          >
            🌸
          </motion.div>
        ))}
      </div>

      {/* TOP BAR matching screenshot */}
      <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 sm:px-6 py-3 bg-white/70 backdrop-blur-md border-b border-stone-200/60 shadow-xs">
        {/* Left: Back button & Status pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 rounded-full border border-rose-200 bg-white/90 px-3.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/60 shadow-xs">
            <Eye className="h-3.5 w-3.5 text-rose-600" />
            <span>This is what your guests will see</span>
          </div>
        </div>

        {/* Right: Try editing */}
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/create?template=${slug}`}
            className="flex items-center gap-1.5 rounded-full border border-rose-300 bg-white/90 px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-all shadow-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Try editing</span>
          </Link>
        </div>
      </header>

      {/* FLOATING ACTION BUTTONS */}
      {/* Top Right Floating Controls */}
      <div className="fixed top-18 right-4 z-40 flex flex-col gap-2.5">
        {/* Audio Toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAudio}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all cursor-pointer ${
            isPlaying
              ? "bg-rose-600 text-white border-rose-500 shadow-rose-900/30"
              : "bg-white/90 text-stone-700 border-stone-200 hover:bg-white"
          }`}
          title={isPlaying ? "Mute Background Music" : "Play Background Music"}
        >
          {isPlaying ? (
            <div className="relative">
              <Volume2 className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
              </span>
            </div>
          ) : (
            <VolumeX className="h-5 w-5 text-stone-400" />
          )}
        </motion.button>

        {/* Petal Shower Trigger */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerPetalShower}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-rose-500 border border-stone-200 shadow-lg hover:bg-rose-50 backdrop-blur-md transition-all cursor-pointer"
          title="Shower Rose Petals"
        >
          <Sparkles className="h-5 w-5" />
        </motion.button>

        {/* Fold back to cover button (if opened) */}
        {isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-stone-700 border border-stone-200 shadow-lg hover:bg-stone-50 backdrop-blur-md transition-all cursor-pointer"
            title="Fold Back to Cover"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Bottom Right Floating CTA matching screenshot */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href={`/dashboard/create?template=${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-rose-950/30 hover:brightness-105 transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Buy this template</span>
          </Link>
        </motion.div>
      </div>

      {/* MAIN VIEWPORT: Floral Palace Garden Background */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        className="relative min-h-screen pt-20 pb-24 flex items-center justify-center px-4 overflow-hidden select-none"
      >
        {/* Template Protection Watermark */}
        <div className="pointer-events-none select-none absolute inset-0 z-30 flex items-center justify-center opacity-[0.07] rotate-[-22deg]">
          <span className="font-mono text-3xl sm:text-5xl font-bold uppercase tracking-widest text-[#12042F] border-4 border-[#12042F] px-8 py-4 rounded-3xl">
            DEMO PREVIEW • PROTECTED
          </span>
        </div>

        {/* Lush Palace Garden Visual Background (Columns, floral arches, roses) */}
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[#FBF2E8] via-[#F8E9DA] to-[#F2DCC8]">
          {/* Classical Column Motifs Left & Right */}
          <div className="absolute inset-y-0 left-0 w-28 sm:w-48 bg-gradient-to-r from-rose-200/40 via-amber-100/30 to-transparent opacity-80" />
          <div className="absolute inset-y-0 right-0 w-28 sm:w-48 bg-gradient-to-l from-rose-200/40 via-amber-100/30 to-transparent opacity-80" />

          {/* Floral Arch top glow */}
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-rose-300/35 via-amber-200/20 to-transparent blur-2xl" />

          {/* Watermark brand texture overlay matching reference screenshot */}
          <div className="absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#881337_1px,transparent_1px)] [background-size:28px_28px]" />
        </div>

        {/* CARD CONTAINER */}
        <div className="relative z-10 w-full max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* ================= COVER: HANGING PARCHMENT CARD MATCHING SCREENSHOT ================= */
              <motion.div
                key="cover"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20, rotateX: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto"
              >
                {/* Top Hanging Cords simulation */}
                <div className="flex justify-between px-16 -mb-2 relative z-0">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-stone-400 to-amber-700/60 shadow-sm" />
                  <div className="w-0.5 h-8 bg-gradient-to-b from-stone-400 to-amber-700/60 shadow-sm" />
                </div>

                {/* The Ornate Framed Parchment Card */}
                <div className="relative rounded-3xl border-2 border-amber-300/80 bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EA] to-[#F5ECE0] p-8 sm:p-14 text-center shadow-2xl shadow-rose-950/15 backdrop-blur-sm">
                  {/* Outer delicate filigree corner accents */}
                  <div className="absolute top-3 left-3 text-amber-600/50 text-sm select-none">✦</div>
                  <div className="absolute top-3 right-3 text-amber-600/50 text-sm select-none">✦</div>
                  <div className="absolute bottom-3 left-3 text-amber-600/50 text-sm select-none">✦</div>
                  <div className="absolute bottom-3 right-3 text-amber-600/50 text-sm select-none">✦</div>

                  {/* Sacred Lord Ganesha Emblem in Gold */}
                  <div className="mx-auto flex flex-col items-center justify-center">
                    {/* Stylized Ganesha Icon SVG */}
                    <svg
                      viewBox="0 0 100 100"
                      className="h-16 w-16 text-amber-700/80 drop-shadow-xs fill-none stroke-current"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {/* Sacred Ganesha Motif */}
                      <path d="M 50 15 Q 50 22 50 30" />
                      <circle cx="50" cy="18" r="2" fill="currentColor" />
                      {/* Ears */}
                      <path d="M 45 28 C 30 28 25 40 32 50 C 37 57 44 56 46 54" />
                      <path d="M 55 28 C 70 28 75 40 68 50 C 63 57 56 56 54 54" />
                      {/* Trunk */}
                      <path d="M 47 40 C 47 55 45 68 55 72 C 60 74 62 68 58 64" />
                      {/* Crown Tilak */}
                      <path d="M 42 22 Q 50 18 58 22" />
                      <path d="M 45 25 Q 50 22 55 25" />
                      <circle cx="50" cy="27" r="1.5" fill="#be123c" />
                    </svg>

                    {/* Sanskrit Inscription */}
                    <h2 className="mt-2 font-serif text-2xl font-bold tracking-wide text-amber-900/90">
                      श्री गणेशाय नमः
                    </h2>
                  </div>

                  {/* Floral Rose Divider with Flourishes */}
                  <div className="my-6 flex items-center justify-center gap-3">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-amber-400 to-amber-700" />
                    <span className="text-amber-800 text-lg">🌹</span>
                    <span className="h-px w-16 bg-gradient-to-l from-transparent via-amber-400 to-amber-700" />
                  </div>

                  {/* Invitation Header Prose matching screenshot */}
                  <p className="font-serif text-sm sm:text-base leading-relaxed text-stone-700 max-w-sm mx-auto italic">
                    We cordially invite you to grace the auspicious occasion of the marriage of...
                  </p>

                  {/* Couple Names */}
                  <div className="mt-5">
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                      {primaryName}
                    </h3>
                    <p className="font-serif text-xl text-rose-800 font-medium italic my-1">&</p>
                    <h3 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900">
                      {secondaryName}
                    </h3>
                  </div>

                  {/* Tap to open Button matching screenshot */}
                  <div className="mt-8">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleTapToOpen}
                      className="group inline-flex items-center justify-center rounded-full border-2 border-amber-500/80 bg-white/70 px-8 py-3 text-xs sm:text-sm font-semibold text-amber-900 shadow-sm hover:bg-amber-50 hover:border-amber-600 transition-all cursor-pointer"
                    >
                      <span className="group-hover:tracking-wider transition-all">Tap to open</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ================= UNFOLDED INVITATION DETAILS ================= */
              <motion.div
                key="unfolded"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* Main Ceremony Card */}
                <div className="rounded-3xl border-2 border-amber-300/80 bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EA] to-[#F5ECE0] p-6 sm:p-10 shadow-2xl backdrop-blur-md">
                  <div className="text-center">
                    <span className="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider border border-rose-200">
                      ॥ शुभ विवाह ॥
                    </span>
                    <h2 className="mt-4 font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                      {primaryName} & {secondaryName}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-stone-600 italic max-w-md mx-auto">
                      "Two souls with but a single thought, two hearts that beat as one."
                    </p>
                  </div>

                  {/* Multi-Day Ceremonies Schedule */}
                  <div className="mt-8 space-y-3.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 text-center">
                      Ceremony Itinerary
                    </h4>

                    {[
                      {
                        name: "Ganesh Pooja & Haldi",
                        date: "December 14, 2026",
                        time: "10:00 AM onwards",
                        venue: "The Palace Courtyard, Udaipur",
                        color: "from-amber-50 to-amber-100 text-amber-900 border-amber-200",
                      },
                      {
                        name: "Sangeet & Musical Evening",
                        date: "December 15, 2026",
                        time: "07:00 PM onwards",
                        venue: "Lake Pavilion Lawns, Udaipur",
                        color: "from-rose-50 to-rose-100 text-rose-900 border-rose-200",
                      },
                      {
                        name: "Vedic Pheras & Wedding Reception",
                        date: "December 16, 2026",
                        time: "06:30 PM Muhurat",
                        venue: "The Grand Royal Ballroom, The Leela Palace",
                        color: "from-rose-50 to-rose-100 text-rose-950 border-rose-200",
                      },
                    ].map((ceremony, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2xl border p-4 bg-gradient-to-r ${ceremony.color} shadow-xs`}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-serif font-bold text-base">{ceremony.name}</h5>
                          <span className="text-[11px] font-semibold opacity-80">{ceremony.time}</span>
                        </div>
                        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs opacity-90 gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{ceremony.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{ceremony.venue}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 1-Tap Google Maps Directions */}
                  <div className="mt-6 rounded-2xl border border-stone-200/90 bg-white/90 p-4 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-stone-900">The Leela Palace, Udaipur</h5>
                        <p className="text-[11px] text-stone-500">Google Maps pinpoints & Uber ready</p>
                      </div>
                    </div>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-stone-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-800 transition-colors"
                    >
                      Open Maps
                    </a>
                  </div>

                  {/* Interactive RSVP Mockup */}
                  <div className="mt-6 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-white to-amber-50/50 p-6 text-center shadow-sm">
                    <h4 className="font-serif text-lg font-bold text-stone-900">
                      Will You Celebrate with Us?
                    </h4>
                    <p className="mt-1 text-xs text-stone-500">
                      Kindly confirm your presence by December 1st, 2026
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        onClick={() => {
                          setHasRsvpd(true);
                          triggerPetalShower();
                        }}
                        className={`w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                          hasRsvpd
                            ? "bg-emerald-600 text-white"
                            : "bg-gradient-to-r from-rose-600 to-amber-600 text-white hover:brightness-105"
                        }`}
                      >
                        {hasRsvpd ? "RSVP Confirmed ✓ (2 Attending)" : "Joyfully Accept • Confirm RSVP"}
                      </button>

                      <button
                        onClick={() => alert("Link copied to clipboard for WhatsApp sharing!")}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-stone-300 bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share on WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  {/* Fold back to cover link */}
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Back to Cover Card</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

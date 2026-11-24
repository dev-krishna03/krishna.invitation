"use client";

import Link from "next/link";
import { Sparkles, Calendar, Heart, ShieldCheck, ArrowRight, Eye } from "lucide-react";

type EventEndedProps = {
  title: string;
  eventType: string;
  names?: string;
  dateStr?: string;
  venue?: string;
  photos?: { url: string; caption?: string | null }[];
};

export function EventEndedView({
  title,
  eventType,
  names,
  dateStr,
  venue,
  photos = [],
}: EventEndedProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Banner */}
      <header className="border-b border-stone-800/80 bg-stone-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold tracking-tight text-white">
              Krishna Invitations
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Event Concluded</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/30 text-amber-300 shadow-lg shadow-amber-950/30">
          <Heart className="h-8 w-8 fill-current" />
        </div>

        <span className="mt-6 inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-semibold">
          Celebration Memories • {eventType}
        </span>

        <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-bold tracking-tight text-stone-100">
          {title}
        </h1>

        {names && (
          <p className="mt-3 font-serif text-xl sm:text-2xl text-amber-200/90 italic">
            {names}
          </p>
        )}

        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-stone-800 bg-stone-900/60 px-5 py-2.5 text-xs text-stone-300">
          {dateStr && (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>{dateStr}</span>
            </div>
          )}
          {dateStr && venue && <span className="text-stone-600">•</span>}
          {venue && <span>{venue}</span>}
        </div>

        <div className="mt-8 rounded-2xl border border-stone-800/90 bg-stone-900/40 p-6 text-xs sm:text-sm text-stone-300 leading-relaxed max-w-lg mx-auto">
          <p>
            This celebration has concluded and the digital invitation validity has ended.
            Thank you from the bottom of our hearts to all the wonderful guests, family, and friends
            who showered their blessings and presence.
          </p>
          <p className="mt-3 text-[11px] text-stone-500">
            Live RSVP submissions and instant messaging have been safely archived.
          </p>
        </div>

        {/* Photo Gallery Recap (if available) */}
        {photos.length > 0 && (
          <div className="mt-12 text-left">
            <h3 className="font-serif text-lg font-bold text-amber-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Celebration Moments</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-stone-800 bg-stone-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption || "Celebration photo"}
                    className="h-full w-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/gallery"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 px-6 py-3 text-xs font-bold text-white shadow-md shadow-rose-950/40 hover:brightness-105 transition-all"
          >
            <span>Create Your Own Digital Invitation</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-600">
        <p>© 2026 Krishna Invitations • Handcrafted with Cultural Devotion</p>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Boxes,
  Sparkles,
  CalendarCheck,
  Share2,
  Users,
  CheckCircle2,
  RefreshCw,
  Flame,
  Music,
  Heart,
  Wine,
  Home,
  Baby,
} from "lucide-react";

type BundledInvitation = {
  id: string;
  title: string;
  slug: string;
  bundle_type: string | null;
  bundle_stage: string;
  events: { id: string; name: string; venue: string | null }[];
  _count: { guests: number; wishes: number };
};

type StandardFunction = {
  name: string;
  defaultDuration: string;
  icon: string;
  occasion: string;
};

type BundleTier = {
  slug: string;
  name: string;
  multiplier: number;
  includedStages: string[];
  description: string;
};

export function EventBundlesView() {
  const [bundledInvs, setBundledInvs] = useState<BundledInvitation[]>([]);
  const [functions, setFunctions] = useState<StandardFunction[]>([]);
  const [bundleTiers, setBundleTiers] = useState<BundleTier[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/event-bundles");
      const d = await res.json();
      if (d.bundledInvitations) setBundledInvs(d.bundledInvitations);
      if (d.standardFunctions) setFunctions(d.standardFunctions);
      if (d.bundleTiers) setBundleTiers(d.bundleTiers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#12042F] flex items-center gap-2">
            <Boxes className="h-6 w-6 text-[#6520EE]" />
            Event Bundles &amp; Multi-Event Occasion Suites
          </h1>
          <p className="mt-1 text-xs text-[#7A7387]">
            Full lifecycle bundles (Save-the-Date, Main Invite, Reminders, Thank You), multi-event function scoping, and guest family links.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-4 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* 4-Stage Suite Packaging */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#12042F]">Lifecycle Occasion Bundles</h2>
          <p className="text-xs text-[#7A7387]">
            One purchase covering the whole event lifecycle with 1 guest list and 1 unified URL family.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              stage: "Stage 01",
              name: "Save-the-Date",
              purpose: "Announce date & city 3-6 months early. Guests bookmark and add to calendar.",
            },
            {
              stage: "Stage 02",
              name: "Main Multi-Event Invitation",
              purpose: "Functions (Mehendi, Sangeet, Pheras), venue map, music, family group RSVP.",
            },
            {
              stage: "Stage 03",
              name: "Day-Before WhatsApp Reminder",
              purpose: "Venue address, Google Map pin, dress code, and countdown sent to confirmed guests.",
            },
            {
              stage: "Stage 04",
              name: "Photo Wall & Thank-You Card",
              purpose: "Post-event gratitude card with photo gallery & guest blessing wall.",
            },
          ].map((s, idx) => (
            <div key={s.stage} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs space-y-2">
              <span className="rounded-full bg-[#6520EE] text-white px-2 py-0.5 text-[9px] font-bold uppercase">
                {s.stage}
              </span>
              <h3 className="font-bold text-sm text-[#12042F]">{s.name}</h3>
              <p className="text-stone-600 leading-relaxed text-[11px]">{s.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Event Preset Functions */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-[#12042F]">Multi-Event Ceremonies &amp; Functions Library</h2>
          <p className="text-xs text-[#7A7387]">
            Each event can have its own venue, Google Maps pin, timings, and guest-scoped visibility.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {functions.map((fn) => (
            <div
              key={fn.name}
              className="flex items-center gap-3 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-3 text-xs"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#6520EE] border border-[#E5D9FC]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-[#12042F] block">{fn.name}</span>
                <span className="text-[10px] text-stone-500 uppercase">{fn.occasion} • {fn.defaultDuration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Bundled Celebrations */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#12042F]">Active Lifecycle Bundles in System</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            {bundledInvs.length} Suites Running
          </span>
        </div>

        <div className="space-y-3">
          {bundledInvs.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#12042F]">{inv.title}</span>
                  <span className="rounded-full bg-[#6520EE] text-white px-2 py-0.5 text-[9px] font-bold">
                    {inv.bundle_stage}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[#7A7387] text-[11px]">
                  <span>{inv.events.length} Ceremonies (Multi-Event)</span>
                  <span>•</span>
                  <span>{inv._count.guests} Guests (Unified List)</span>
                  <span>•</span>
                  <span>{inv._count.wishes} Wishes / Photos</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/invite/${inv.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#E5D9FC] bg-white px-4 py-1.5 font-semibold text-[#12042F] hover:bg-[#F5F1FE]"
                >
                  Live Demo
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Eye,
  ArrowRight,
  Search,
  Star,
  Filter,
  Check,
  Music,
  Smartphone,
  Flag,
} from "lucide-react";

type Item = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  thumbnail_url?: string | null;
  fromPrice?: { price: number; days: number } | null;
};

const OCCASION_CATEGORIES = [
  { id: "ALL", label: "All Designs" },
  { id: "Wedding", label: "Wedding & Pheras" },
  { id: "Engagement", label: "Engagement & Roka" },
  { id: "Birthday", label: "Birthday Celebrations" },
  { id: "Baby Shower", label: "Baby Shower / Godh Bharai" },
  { id: "Anniversary", label: "Anniversary Milestones" },
  { id: "Housewarming", label: "Housewarming / Griha Pravesh" },
  { id: "Festival", label: "Festival (Diwali, Eid, Navratri)" },
  { id: "Corporate", label: "Corporate & Farewell" },
];

export function GalleryGrid({ items }: { items: Item[] }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStyle, setSelectedStyle] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlanModalItem, setActivePlanModalItem] = useState<Item | null>(null);

  // Copyright Report states
  const [reportingItem, setReportingItem] = useState<Item | null>(null);
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);

  async function handleSubmitReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportingItem) return;
    setSubmittingReport(true);
    setReportMsg(null);
    try {
      const res = await fetch("/api/copyright-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: reportingItem.id,
          reporter_name: reporterName,
          reporter_email: reporterEmail,
          proof_url: proofUrl,
          description: reportDesc,
        }),
      });
      const d = await res.json();
      if (d.ok) {
        setReportMsg("Copyright notice submitted. Our trust & safety team has quarantined this claim for super admin review.");
        setTimeout(() => {
          setReportingItem(null);
          setReportMsg(null);
          setReportDesc("");
          setProofUrl("");
        }, 3000);
      }
    } finally {
      setSubmittingReport(false);
    }
  }

  const filtered = items.filter((t) => {
    const matchesCategory =
      selectedCategory === "ALL" ||
      t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      t.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(selectedCategory.toLowerCase()));

    const matchesStyle =
      selectedStyle === "ALL" ||
      t.category.toLowerCase().includes(selectedStyle.toLowerCase()) ||
      t.slug.toLowerCase().includes(selectedStyle.toLowerCase());

    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStyle && matchesQuery;
  });

  return (
    <div className="mt-8 space-y-6">
      {/* Category Pills Slider - Balcony Pill Design */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5D9FC]/60">
        {OCCASION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-full px-5 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#6520EE] text-white shadow-md shadow-[#6520EE]/20 font-bold"
                : "bg-white text-stone-600 border border-[#E5D9FC] hover:bg-[#F5F1FE] hover:text-[#12042F]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Controls: Search & Style Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Style Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Style:
          </span>
          {[
            { id: "ALL", label: "All Styles" },
            { id: "royal", label: "Royal Palace" },
            { id: "floral", label: "Floral Pastel" },
            { id: "minimal", label: "Minimalist Modern" },
            { id: "traditional", label: "Traditional Vedic" },
          ].map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`rounded-full px-3.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                selectedStyle === style.id
                  ? "bg-[#12042F] text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-[#F5F1FE] hover:text-[#6520EE]"
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search occasion or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-[#E5D9FC] bg-white py-2 pl-9 pr-4 text-xs text-[#12042F] placeholder-stone-400 shadow-xs focus:border-[#6520EE] focus:outline-none focus:ring-1 focus:ring-[#6520EE]"
          />
        </div>
      </div>

      {/* Template Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F1FE] text-[#6520EE]">
            <Filter className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-[#12042F]">No templates found</h3>
          <p className="mt-1 text-xs text-stone-500">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((t) => {
              const isRoyal = t.slug.includes("royal");
              const basePrice = t.fromPrice?.price || 999;

              return (
                <motion.div
                  layout
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="group overflow-hidden rounded-3xl border border-[#E5D9FC]/80 bg-white p-3.5 shadow-sm hover:border-[#6520EE] hover:shadow-xl hover:shadow-[#6520EE]/10 transition-all">
                    {/* Mockup / View Image Card Display */}
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-[#F5F1FE] via-[#FAF9FD] to-[#EBE2FD] p-5 flex flex-col justify-between transition-transform duration-300 group-hover:scale-[1.01]">
                      {t.thumbnail_url && (
                        <>
                          <img
                            src={t.thumbnail_url}
                            alt={t.name}
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" />
                        </>
                      )}

                      <div className="relative z-10 flex items-center justify-between">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          t.thumbnail_url
                            ? "bg-black/60 text-white backdrop-blur-md border border-white/20"
                            : "bg-white/95 text-[#6520EE]"
                        }`}>
                          {t.category}
                        </span>
                        <span className="rounded-full bg-[#6520EE] text-white px-2.5 py-0.5 text-[10px] font-bold shadow-sm">
                          {isRoyal ? "Shahi Patra" : "Modern"}
                        </span>
                      </div>

                      <div className={`text-center my-auto py-4 relative z-10 ${t.thumbnail_url ? "text-white" : ""}`}>
                        <div className={`text-[10px] uppercase font-bold tracking-[0.2em] ${
                          t.thumbnail_url ? "text-amber-300" : "text-[#6520EE]/80"
                        }`}>
                          {isRoyal ? "॥ Shahi Nimantran ॥" : "Digital Website Invite"}
                        </div>
                        <div className={`mt-2 text-xl font-bold tracking-tight ${
                          t.thumbnail_url ? "text-white drop-shadow-md" : "text-[#12042F]"
                        }`}>
                          {t.name}
                        </div>
                        <p className={`mt-2 text-xs line-clamp-2 max-w-[220px] mx-auto ${
                          t.thumbnail_url ? "text-stone-200 drop-shadow-xs" : "text-stone-600"
                        }`}>
                          {t.description ?? "Elegant digital website invitation with music & RSVP."}
                        </p>
                      </div>

                      <div className={`relative z-10 flex items-center justify-between rounded-xl backdrop-blur-md p-2 px-3 text-[11px] font-semibold border ${
                        t.thumbnail_url
                          ? "bg-black/50 text-white border-white/20"
                          : "bg-white/80 text-stone-700 border-white/60"
                      }`}>
                        <span className={`flex items-center gap-1 ${t.thumbnail_url ? "text-amber-300" : "text-[#6520EE]"}`}>
                          <Music className="h-3 w-3" />
                          <span>Soundtrack</span>
                        </span>
                        <span className={`flex items-center gap-1 ${t.thumbnail_url ? "text-stone-300" : "text-stone-500"}`}>
                          <Smartphone className="h-3 w-3" />
                          <span>WhatsApp Ready</span>
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Pricing Details */}
                    <div className="mt-4 px-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>4.9</span>
                          <span className="text-stone-400 font-normal">(42 reviews)</span>
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium">by Verified Studio</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <h3 className="text-sm font-bold text-[#12042F] group-hover:text-[#6520EE] transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-xs font-bold text-[#6520EE]">
                            From ₹{basePrice.toLocaleString()}{" "}
                            <span className="text-stone-400 font-normal">/ 15 days</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setReportingItem(t)}
                            title="Report Copyright / DMCA"
                            className="p-1.5 rounded-full text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Flag className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setActivePlanModalItem(t)}
                            className="rounded-full bg-[#F5F1FE] hover:bg-[#E5D9FC] px-3 py-1 text-[11px] font-bold text-[#6520EE] transition-colors cursor-pointer border border-[#E5D9FC]"
                          >
                            Plans
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-3.5 grid grid-cols-2 gap-2">
                      <Link
                        href={`/try/${t.slug}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E5D9FC] bg-white px-3 py-2 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] transition-colors no-underline"
                      >
                        <Eye className="h-3.5 w-3.5 text-[#6520EE]" />
                        <span>Live Demo</span>
                      </Link>
                      <Link
                        href={`/dashboard/create?template=${t.slug}`}
                        className="inline-flex items-center justify-center gap-1 rounded-full bg-[#6520EE] hover:bg-[#5213D2] px-3 py-2 text-xs font-bold text-white shadow-sm shadow-[#6520EE]/20 transition-all no-underline"
                      >
                        <span>Select</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ================= PAY-BY-DAYS PRICING MODAL ================= */}
      {activePlanModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-2xl text-[#12042F] space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6520EE] bg-[#F5F1FE] px-2.5 py-0.5 rounded-full border border-[#E5D9FC]">
                  Pay-by-Days Pricing
                </span>
                <h3 className="mt-1 text-lg font-bold text-[#12042F]">
                  {activePlanModalItem.name}
                </h3>
              </div>
              <button
                onClick={() => setActivePlanModalItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Choose how long your digital invitation stays live online for guests.
              Extend anytime later by paying for more days!
            </p>

            {/* 4 Pay-by-Days Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                {
                  plan: "Basic",
                  days: 15,
                  mult: "Base × 1.0",
                  price: activePlanModalItem.fromPrice?.price || 999,
                  updates: "1 Live Update",
                  links: "5 Personal Links",
                },
                {
                  plan: "Standard",
                  days: 30,
                  mult: "Base × 1.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 1.5),
                  updates: "3 Live Updates",
                  links: "25 Personal Links",
                  highlight: true,
                },
                {
                  plan: "Premium",
                  days: 90,
                  mult: "Base × 2.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 2.5),
                  updates: "10 Live Updates",
                  links: "100 Personal Links",
                },
                {
                  plan: "Extended",
                  days: 180,
                  mult: "Base × 3.5",
                  price: Math.round((activePlanModalItem.fromPrice?.price || 999) * 3.5),
                  updates: "Unlimited Updates",
                  links: "Unlimited Links",
                },
              ].map((tier) => (
                <div
                  key={tier.plan}
                  className={`rounded-3xl border p-4 flex flex-col justify-between ${
                    tier.highlight
                      ? "border-[#6520EE] bg-[#F5F1FE]/50 ring-1 ring-[#6520EE] shadow-sm"
                      : "border-[#E5D9FC]/70 bg-stone-50/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#12042F] text-sm">
                        {tier.plan} ({tier.days} Days)
                      </span>
                      {tier.highlight && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-[#6520EE] px-2.5 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-[#12042F]">
                      ₹{tier.price.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-stone-500 font-semibold">{tier.mult}</span>

                    <ul className="mt-3 space-y-1 text-[11px] text-stone-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{tier.updates}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{tier.links}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp Personal Sending</span>
                      </li>
                    </ul>
                  </div>

                  <Link
                    href={`/dashboard/create?template=${activePlanModalItem.slug}&days=${tier.days}`}
                    className={`mt-4 w-full flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition-all no-underline ${
                      tier.highlight
                        ? "bg-[#6520EE] text-white hover:bg-[#5213D2] shadow-sm"
                        : "bg-[#12042F] text-white hover:bg-stone-800"
                    }`}
                  >
                    <span>Choose {tier.plan}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>

            {/* Platform & Creator Revenue Transparency */}
            <div className="rounded-2xl border border-[#E5D9FC] bg-[#F5F1FE] p-3 text-[11px] text-stone-600 flex items-center justify-between">
              <span>Creator Marketplace Split:</span>
              <span className="font-bold text-[#12042F]">90% creator royalties • 10% platform fee</span>
            </div>
          </div>
        </div>
      )}

      {/* Copyright / DMCA Report Modal */}
      {reportingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12042F]/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setReportingItem(null)}
              className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
            >
              ✕
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Trust &amp; Safety</span>
              <h3 className="text-base font-bold text-[#12042F]">Report Copyright / DMCA Infringement</h3>
              <p className="text-xs text-stone-500 mt-0.5">Reporting template: <strong>{reportingItem.name}</strong></p>
            </div>

            {reportMsg ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
                {reportMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Your Full Name *</label>
                  <input
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    required
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full rounded-2xl border border-[#E5D9FC] p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    required
                    placeholder="e.g. legal@yourstudio.com"
                    className="w-full rounded-2xl border border-[#E5D9FC] p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Proof URL / Original Artwork Link *</label>
                  <input
                    type="url"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    required
                    placeholder="https://..."
                    className="w-full rounded-2xl border border-[#E5D9FC] p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#12042F] mb-1">Infringement Description *</label>
                  <textarea
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    required
                    rows={3}
                    placeholder="Describe how this design infringes your copyrighted artwork, graphics or typography..."
                    className="w-full rounded-2xl border border-[#E5D9FC] p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReport}
                  className="w-full rounded-full bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-semibold text-white transition-colors"
                >
                  {submittingReport ? "Submitting..." : "Submit DMCA Notice"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

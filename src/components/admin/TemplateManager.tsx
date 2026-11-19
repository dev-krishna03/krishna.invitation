"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Plus,
  Sparkles,
  Music,
  Upload,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Volume2,
  Star,
  FileAudio,
  Eye,
  AlertCircle,
  Tag,
} from "lucide-react";

type TemplateItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  preview_url: string | null;
  category: string;
  event_types: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  pricing: { id?: string; duration_days: number; price: number }[];
  _count?: { invitations: number };
};

const CATEGORIES = ["LUXURY", "FLORAL", "TRADITIONAL", "MINIMAL", "MODERN", "RUSTIC"];

const EVENT_OPTIONS = [
  { id: "wedding", label: "Wedding" },
  { id: "engagement", label: "Engagement" },
  { id: "sangeet", label: "Sangeet" },
  { id: "haldi", label: "Haldi" },
  { id: "mehndi", label: "Mehndi" },
  { id: "reception", label: "Reception" },
  { id: "gruh-vastu", label: "Gruh Vastu" },
  { id: "baby-shower", label: "Baby Shower" },
  { id: "birthday", label: "Birthday" },
  { id: "pooja", label: "Pooja" },
  { id: "anniversary", label: "Anniversary" },
  { id: "festival", label: "Festival" },
];

const PRESET_SONGS = [
  { name: "Kudmayi • Royal Shehnai & Sitar", url: "/audio/presets/shehnai-wedding.wav" },
  { name: "Shubh Vivah Mangalam • Flute & Shehnai", url: "/audio/presets/shubh-mangalam.wav" },
  { name: "Acoustic Sitar & Romantic Strings", url: "/audio/presets/sitar-flute.wav" },
  { name: "Sacred Chimes & Temple Bells", url: "/audio/presets/sacred-chimes.wav" },
];

export function TemplateManager({ initialTemplates }: { initialTemplates: TemplateItem[] }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio player state
  const [activeSongUrl, setActiveSongUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("LUXURY");
  const [description, setDescription] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["wedding", "engagement", "reception"]);
  const [audioUrl, setAudioUrl] = useState("/audio/presets/shehnai-wedding.wav");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pricingTiers, setPricingTiers] = useState<
    { duration_days: number; price: number }[]
  >([
    { duration_days: 30, price: 499 },
    { duration_days: 90, price: 899 },
    { duration_days: 365, price: 1499 },
  ]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Auto-generate slug when name changes
  function handleNameChange(val: string) {
    setName(val);
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generated);
  }

  // Audio playback toggle
  function togglePlaySong(url: string) {
    if (activeSongUrl === url && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => {});
        setActiveSongUrl(url);
        setIsPlaying(true);
      }
    }
  }

  // Handle Audio File Upload
  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/templates/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to upload audio");

      setAudioUrl(data.url);
      setUploadedFileName(file.name);
      // Auto play uploaded file preview
      togglePlaySong(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Audio upload failed");
    } finally {
      setUploadingAudio(false);
    }
  }

  // Submit New Template
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name,
        slug,
        category,
        description,
        event_types: selectedEvents,
        preview_url: audioUrl, // Store selected/uploaded song in preview_url
        thumbnail_url: category === "LUXURY" ? "/images/royal.jpg" : "/images/floral.jpg",
        is_active: isActive,
        is_featured: isFeatured,
        sort_order: templates.length + 1,
        pricing: pricingTiers,
      };

      const res = await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create template");

      setTemplates((prev) => [...prev, data.template]);
      setIsModalOpen(false);
      resetForm();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving template");
    } finally {
      setLoading(false);
    }
  }

  // Toggle active/featured
  async function handleToggle(id: string, field: "is_active" | "is_featured", currentVal: boolean) {
    try {
      const res = await fetch(`/api/admin/templates/${id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ [field]: !currentVal }),
      });
      if (res.ok) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, [field]: !currentVal } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Template
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setAudioUrl("/audio/presets/shehnai-wedding.wav");
    setUploadedFileName(null);
    setError(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hidden Global Audio Element */}
      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header with Title and "Add Template" CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Palette className="h-6 w-6 text-amber-400" />
            <span>Invitation Template Studio</span>
          </h1>
          <p className="mt-1 text-xs text-stone-400">
            Publish royal and modern celebration designs, manage duration pricing tiers, and configure background songs.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-950/40 hover:brightness-105 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Template</span>
        </button>
      </div>

      {/* Templates Table Container */}
      <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-950/70 shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="border-b border-stone-800 bg-stone-900/80 text-[10px] uppercase tracking-wider text-stone-400 font-bold">
              <tr>
                <th className="px-5 py-3.5">Template Design</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Background Song / Audio</th>
                <th className="px-4 py-3.5">Starting Tier</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Featured</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-500">
                    No templates registered. Click "Add New Template" above.
                  </td>
                </tr>
              ) : (
                templates.map((t) => {
                  const songUrl = t.preview_url || "/audio/presets/shehnai-wedding.wav";
                  const isCurrentSongPlaying = activeSongUrl === songUrl && isPlaying;
                  const lowestPricing = t.pricing?.[0];

                  return (
                    <tr key={t.id} className="hover:bg-stone-900/50 transition-colors">
                      {/* Name & Slug */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-transparent border border-rose-500/30 text-rose-300 font-serif font-bold text-sm">
                            {t.name[0]}
                          </div>
                          <div>
                            <div className="font-serif font-bold text-sm text-white">{t.name}</div>
                            <div className="text-[11px] font-mono text-stone-500">{t.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-stone-800 px-2.5 py-1 text-[10px] font-bold text-stone-300 border border-stone-700">
                          {t.category}
                        </span>
                      </td>

                      {/* Background Song Player */}
                      <td className="px-4 py-4">
                        <button
                          onClick={() => togglePlaySong(songUrl)}
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                            isCurrentSongPlaying
                              ? "bg-rose-600/30 text-rose-300 border-rose-500/60 animate-pulse"
                              : "bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/40"
                          }`}
                        >
                          {isCurrentSongPlaying ? (
                            <Pause className="h-3.5 w-3.5 fill-current" />
                          ) : (
                            <Play className="h-3.5 w-3.5 fill-current text-amber-400" />
                          )}
                          <span className="truncate max-w-[140px]">
                            {songUrl.split("/").pop()?.replace(/^[0-9]+-/, "") ?? "Listen Song"}
                          </span>
                        </button>
                      </td>

                      {/* Pricing Tier */}
                      <td className="px-4 py-4">
                        {lowestPricing ? (
                          <div>
                            <span className="font-bold text-rose-400">₹{lowestPricing.price}</span>
                            <span className="text-[10px] text-stone-500"> / {lowestPricing.duration_days}d</span>
                          </div>
                        ) : (
                          <span className="text-stone-500">—</span>
                        )}
                      </td>

                      {/* Active Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggle(t.id, "is_active", t.is_active)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors cursor-pointer ${
                            t.is_active
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-stone-800 text-stone-500 border border-stone-700"
                          }`}
                        >
                          {t.is_active ? "Active" : "Disabled"}
                        </button>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggle(t.id, "is_featured", t.is_featured)}
                          className={`flex items-center justify-center mx-auto h-7 w-7 rounded-lg border transition-colors ${
                            t.is_featured
                              ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm"
                              : "text-stone-600 border-stone-800 hover:text-stone-400"
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`h-4 w-4 ${t.is_featured ? "fill-current" : ""}`} />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/try/${t.slug}`}
                            target="_blank"
                            className="flex h-8 items-center gap-1 rounded-lg border border-stone-800 bg-stone-900 px-2.5 text-[11px] font-semibold text-stone-300 hover:border-amber-400/40 hover:text-white transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Preview</span>
                          </Link>

                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-800 text-stone-500 hover:bg-rose-500/20 hover:text-rose-400 transition-colors"
                            title="Delete template"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Template & Upload Audio */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-800 bg-stone-950 p-6 sm:p-8 text-stone-200 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-rose-600 to-rose-700 text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-white">Add New Template</h2>
                    <p className="text-xs text-stone-400">Configure theme details, pricing, and audio song.</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-900 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Name & Slug Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Template Name *
                    </label>
                    <input
                      required
                      placeholder="e.g. Rose Garden Royal"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Unique Slug *
                    </label>
                    <input
                      required
                      placeholder="e.g. rose-garden-royal"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 font-mono text-xs text-amber-300 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Category & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">Description</label>
                    <input
                      placeholder="e.g. Rose floral arch with gold ornamental Ganesha & shehnai audio."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Audio Upload & Song Section */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4 text-amber-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Celebration Song / Background Music
                      </h4>
                    </div>
                    {audioUrl && (
                      <button
                        type="button"
                        onClick={() => togglePlaySong(audioUrl)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          activeSongUrl === audioUrl && isPlaying
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-amber-400 text-stone-950 hover:bg-amber-300"
                        }`}
                      >
                        {activeSongUrl === audioUrl && isPlaying ? (
                          <>
                            <Pause className="h-3 w-3" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Test Audio</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-400">
                    Upload an MP3/WAV song file or select one of our curated sacred Indian celebration melodies.
                  </p>

                  {/* Preset Buttons */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1.5">
                      Curated Celebration Presets:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRESET_SONGS.map((song) => {
                        const isSelected = audioUrl === song.url;
                        return (
                          <button
                            key={song.url}
                            type="button"
                            onClick={() => {
                              setAudioUrl(song.url);
                              setUploadedFileName(null);
                              togglePlaySong(song.url);
                            }}
                            className={`flex items-center justify-between rounded-xl p-2.5 text-xs text-left transition-all border ${
                              isSelected
                                ? "bg-amber-500/20 border-amber-400/80 text-amber-200"
                                : "bg-stone-900 border-stone-800 text-stone-300 hover:bg-stone-800"
                            }`}
                          >
                            <span className="truncate pr-2">{song.name}</span>
                            {isSelected && <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom File Upload Input */}
                  <div className="pt-2 border-t border-stone-800/80">
                    <label className="block text-[11px] font-semibold text-stone-300 mb-1.5">
                      Or Upload Custom MP3 / WAV Song:
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 rounded-xl border border-dashed border-stone-700 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-300 hover:border-amber-400 hover:text-white cursor-pointer transition-colors">
                        <Upload className="h-4 w-4 text-amber-400" />
                        <span>{uploadingAudio ? "Uploading File…" : "Choose Audio File"}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          disabled={uploadingAudio}
                          className="hidden"
                        />
                      </label>
                      {uploadedFileName && (
                        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[200px]">{uploadedFileName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Types Multi-select */}
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                    Supported Event Types
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EVENT_OPTIONS.map((e) => {
                      const isChecked = selectedEvents.includes(e.id);
                      return (
                        <button
                          key={e.id}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedEvents(selectedEvents.filter((id) => id !== e.id));
                            } else {
                              setSelectedEvents([...selectedEvents, e.id]);
                            }
                          }}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all border ${
                            isChecked
                              ? "bg-rose-600 text-white border-rose-500"
                              : "bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700"
                          }`}
                        >
                          {e.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Tiers Builder */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-300">
                      Pricing Tiers (Duration & Price in ₹)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPricingTiers([...pricingTiers, { duration_days: 60, price: 699 }])
                      }
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                    >
                      + Add Tier
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {pricingTiers.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl bg-stone-900 border border-stone-800 p-2 text-xs"
                      >
                        <input
                          type="number"
                          placeholder="Days"
                          value={p.duration_days}
                          onChange={(e) => {
                            const next = [...pricingTiers];
                            next[idx].duration_days = Number(e.target.value);
                            setPricingTiers(next);
                          }}
                          className="w-16 rounded bg-stone-950 px-2 py-1 text-white text-xs border border-stone-800"
                        />
                        <span className="text-stone-500">days:</span>
                        <input
                          type="number"
                          placeholder="₹"
                          value={p.price}
                          onChange={(e) => {
                            const next = [...pricingTiers];
                            next[idx].price = Number(e.target.value);
                            setPricingTiers(next);
                          }}
                          className="w-20 rounded bg-stone-950 px-2 py-1 text-amber-300 font-bold text-xs border border-stone-800"
                        />
                        {pricingTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setPricingTiers(pricingTiers.filter((_, i) => i !== idx))}
                            className="text-stone-500 hover:text-rose-400 ml-auto"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active & Featured Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-rose-600 focus:ring-0"
                    />
                    <span>Active for Public Display</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-0"
                    />
                    <span>Featured on Homepage</span>
                  </label>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-stone-800 bg-stone-900 px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingAudio}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-950/40 hover:brightness-105 disabled:opacity-50 cursor-pointer"
                  >
                    <span>{loading ? "Publishing Template…" : "Publish Template"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

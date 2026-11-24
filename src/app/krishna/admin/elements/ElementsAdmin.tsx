"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  Trash2,
  Loader2,
  Settings2,
  Layers,
  Image as ImageIcon,
  Film,
  Music,
  Code,
  Sparkles,
  User,
  Search,
  Filter,
  Eye,
  Play,
  Pause,
  ExternalLink,
  CheckCircle2,
  X,
  FileCheck,
} from "lucide-react";

export type ElementVM = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  category: string;
  icon: string | null;
  description: string | null;
  default_props: Record<string, unknown>;
  file_url: string | null;
  file_format: string | null;
  file_size: number | null;
  media_type: string | null;
  owner_user_id: string | null;
  owner: { id: string; name: string | null; email: string } | null;
  is_pro_only: boolean;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
};

const FORMATS = [
  "ALL",
  "SVG",
  "PNG",
  "JPG",
  "JPEG",
  "GIF",
  "MP4",
  "MOV",
  "WEBM",
  "MP3",
  "M4A",
  "WAV",
] as const;

export function ElementsAdmin({ initial }: { initial: ElementVM[] }) {
  const [items, setItems] = useState<ElementVM[]>(initial);
  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "CREATOR" | "SYSTEM">("ALL");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"ALL" | "IMAGE" | "VECTOR" | "VIDEO" | "AUDIO">("ALL");
  const [showAdd, setShowAdd] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // New Draft Platform Element
  const [name, setName] = useState("");
  const [kind, setKind] = useState("IMAGE");
  const [category, setCategory] = useState("wedding");
  const [fileUrl, setFileUrl] = useState("");
  const [fileFormat, setFileFormat] = useState("SVG");
  const [isProOnly, setIsProOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtering
  const filtered = useMemo(() => {
    return items.filter((el) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        el.name.toLowerCase().includes(q) ||
        el.category.toLowerCase().includes(q) ||
        el.slug.toLowerCase().includes(q) ||
        (el.owner?.name?.toLowerCase().includes(q) ?? false) ||
        (el.owner?.email.toLowerCase().includes(q) ?? false);

      if (!matchesSearch) return false;

      // Source filter
      if (sourceFilter === "CREATOR" && !el.owner_user_id) return false;
      if (sourceFilter === "SYSTEM" && el.owner_user_id) return false;

      // Format filter
      if (formatFilter !== "ALL") {
        const fmt = (el.file_format || "").toUpperCase();
        if (formatFilter === "JPG" && (fmt === "JPG" || fmt === "JPEG")) {
          // match
        } else if (fmt !== formatFilter) {
          return false;
        }
      }

      // Media type filter
      if (mediaTypeFilter !== "ALL") {
        if (el.media_type !== mediaTypeFilter) return false;
      }

      return true;
    });
  }, [items, search, formatFilter, sourceFilter, mediaTypeFilter]);

  const creatorUploadsCount = useMemo(() => items.filter((i) => i.owner_user_id).length, [items]);
  const systemElementsCount = useMemo(() => items.filter((i) => !i.owner_user_id).length, [items]);

  async function toggleActive(el: ElementVM) {
    const updated = !el.is_active;
    setItems((prev) => prev.map((x) => (x.id === el.id ? { ...x, is_active: updated } : x)));
    await fetch(`/api/admin/elements/${el.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: updated }),
    });
  }

  async function removeElement(el: ElementVM) {
    if (!confirm(`Delete element "${el.name}"?`)) return;
    setItems((prev) => prev.filter((x) => x.id !== el.id));
    await fetch(`/api/admin/elements/${el.id}`, { method: "DELETE" });
  }

  function formatBytes(bytes: number | null): string {
    if (!bytes || bytes <= 0) return "—";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  function toggleAudio(id: string, url: string) {
    const audioEl = document.getElementById(`audio-player-${id}`) as HTMLAudioElement | null;
    if (!audioEl) return;
    if (playingAudioId === id) {
      audioEl.pause();
      setPlayingAudioId(null);
    } else {
      // Pause any existing
      if (playingAudioId) {
        const prev = document.getElementById(`audio-player-${playingAudioId}`) as HTMLAudioElement | null;
        prev?.pause();
      }
      audioEl.play().catch(() => {});
      setPlayingAudioId(id);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-gradient-to-r from-[#FAF9FD] via-white to-[#F5F1FE] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6520EE] text-white shadow-xs">
              <Layers className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-[#12042F]">
                Universal Elements &amp; Multi-Format Media Hub
              </h2>
              <p className="text-xs text-[#7A7387] mt-0.5">
                Full platform directory of creator-uploaded assets and system elements. Supported formats:{" "}
                <strong className="text-[#12042F]">SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 rounded-2xl bg-[#6520EE] hover:bg-[#5218c5] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add System Element</span>
            </button>
          </div>
        </div>

        {/* Source Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-5 border-t border-stone-100 mt-5">
          <button
            onClick={() => setSourceFilter("ALL")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === "ALL"
                ? "bg-[#6520EE] text-white shadow-xs"
                : "bg-white border border-[#E5D9FC] text-stone-600 hover:bg-[#F5F1FE]"
            }`}
          >
            All Elements ({items.length})
          </button>
          <button
            onClick={() => setSourceFilter("CREATOR")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === "CREATOR"
                ? "bg-[#6520EE] text-white shadow-xs"
                : "bg-white border border-[#E5D9FC] text-stone-600 hover:bg-[#F5F1FE]"
            }`}
          >
            Creator Uploaded ({creatorUploadsCount})
          </button>
          <button
            onClick={() => setSourceFilter("SYSTEM")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              sourceFilter === "SYSTEM"
                ? "bg-[#6520EE] text-white shadow-xs"
                : "bg-white border border-[#E5D9FC] text-stone-600 hover:bg-[#F5F1FE]"
            }`}
          >
            Platform System ({systemElementsCount})
          </button>
        </div>
      </div>

      {/* Filter Ribbon: Search + Format Badges */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elements by name, creator, category, or slug..."
              className="w-full rounded-xl border border-stone-200 bg-[#FAF9FD] pl-9 pr-3 py-2 text-xs text-stone-900 outline-none focus:border-[#6520EE] focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-stone-500">Media Type:</span>
            {(["ALL", "IMAGE", "VECTOR", "VIDEO", "AUDIO"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMediaTypeFilter(m)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                  mediaTypeFilter === m
                    ? "bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC]"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Supported File Format Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
            File Formats:
          </span>
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold transition-all cursor-pointer ${
                formatFilter === fmt
                  ? "bg-[#12042F] text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {fmt === "ALL" ? "All Formats" : `.${fmt}`}
            </button>
          ))}
        </div>
      </div>

      {/* Elements Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center text-xs text-stone-500">
            No elements match your filters.
          </div>
        ) : (
          filtered.map((el) => {
            const isAudio = el.file_format === "MP3" || el.file_format === "WAV" || el.file_format === "M4A" || el.media_type === "AUDIO";
            const isVideo = el.file_format === "MP4" || el.file_format === "MOV" || el.file_format === "WEBM" || el.media_type === "VIDEO";
            const isVector = el.file_format === "SVG" || el.media_type === "VECTOR";

            return (
              <div
                key={el.id}
                className={`rounded-3xl border bg-white p-4 shadow-xs flex flex-col justify-between transition-all hover:border-[#6520EE]/40 ${
                  !el.is_active ? "opacity-60 bg-stone-50" : ""
                } ${el.owner_user_id ? "border-purple-200 ring-1 ring-purple-50" : "border-stone-200"}`}
              >
                <div>
                  {/* Media Thumbnail / Player */}
                  <div className="relative aspect-video w-full rounded-2xl bg-[#FAF9FD] border border-stone-100 overflow-hidden flex items-center justify-center mb-3">
                    {/* Audio Player Card */}
                    {isAudio && (
                      <div className="flex flex-col items-center justify-center p-3 text-center w-full">
                        <Music className="h-8 w-8 text-[#6520EE] mb-1.5 animate-pulse" />
                        <button
                          onClick={() => el.file_url && toggleAudio(el.id, el.file_url)}
                          disabled={!el.file_url}
                          className="flex items-center gap-1 rounded-full bg-[#6520EE] text-white px-3 py-1 text-[10px] font-bold shadow-xs hover:bg-[#5218c5] cursor-pointer"
                        >
                          {playingAudioId === el.id ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                          <span>{playingAudioId === el.id ? "Pause Audio" : "Play Preview"}</span>
                        </button>
                        {el.file_url && (
                          <audio
                            id={`audio-player-${el.id}`}
                            src={el.file_url}
                            onEnded={() => setPlayingAudioId(null)}
                            className="hidden"
                          />
                        )}
                      </div>
                    )}

                    {/* Video Player Card */}
                    {isVideo && el.file_url && (
                      <video
                        src={el.file_url}
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Image / SVG Preview */}
                    {!isAudio && !isVideo && el.file_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={el.file_url}
                        alt={el.name}
                        className="w-full h-full object-contain p-2 hover:scale-105 transition-transform"
                      />
                    )}

                    {/* Fallback Icon */}
                    {!el.file_url && (
                      <div className="flex flex-col items-center justify-center text-stone-400">
                        {isVector ? (
                          <Code className="h-8 w-8 text-[#6520EE]" />
                        ) : isVideo ? (
                          <Film className="h-8 w-8 text-indigo-500" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-stone-400" />
                        )}
                        <span className="text-[10px] font-mono mt-1 font-bold">.{el.file_format || el.kind}</span>
                      </div>
                    )}

                    {/* Format Badge overlay */}
                    {el.file_format && (
                      <span className="absolute top-2 left-2 rounded-md bg-stone-900/85 backdrop-blur-xs text-white px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase">
                        {el.file_format}
                      </span>
                    )}

                    {/* Category pill */}
                    <span className="absolute top-2 right-2 rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold text-stone-700 border border-stone-200">
                      {el.category}
                    </span>
                  </div>

                  {/* Element Details */}
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-[#12042F] truncate" title={el.name}>
                        {el.name}
                      </h4>
                      {el.is_pro_only && (
                        <span className="rounded bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 shrink-0">
                          PRO
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-stone-500 line-clamp-1">
                      {el.description || `Slug: ${el.slug}`}
                    </p>

                    {/* Creator Attribution */}
                    <div className="pt-2 border-t border-stone-100 text-[10px]">
                      {el.owner ? (
                        <div className="flex items-center gap-1 text-purple-700 font-semibold truncate">
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            By: {el.owner.name || el.owner.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 font-medium">Platform Default</span>
                      )}

                      <div className="flex items-center justify-between text-stone-400 text-[9px] mt-0.5 font-mono">
                        <span>Size: {formatBytes(el.file_size)}</span>
                        <span>Kind: {el.kind}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={el.is_active}
                      onChange={() => toggleActive(el)}
                      className="rounded accent-[#6520EE]"
                    />
                    <span>{el.is_active ? "Active" : "Disabled"}</span>
                  </label>

                  <div className="flex items-center gap-1">
                    {el.file_url && (
                      <a
                        href={el.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                        title="Open file in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <button
                      onClick={() => removeElement(el)}
                      className="rounded-lg p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete element"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add System Element Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-[#E5D9FC] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-sm text-[#12042F] flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#6520EE]" />
                Add Platform System Element
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="text-stone-400 hover:text-stone-600 rounded-full p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  Element Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Gold Jharokha Motif"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold text-stone-900"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    File Format
                  </span>
                  <select
                    value={fileFormat}
                    onChange={(e) => setFileFormat(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-900 bg-white"
                  >
                    {FORMATS.filter((f) => f !== "ALL").map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                    Category
                  </span>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. wedding, decor, music"
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-900"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  File Asset URL
                </span>
                <input
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://... or /uploads/..."
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono text-stone-900"
                />
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isProOnly}
                  onChange={(e) => setIsProOnly(e.target.checked)}
                  className="rounded accent-[#6520EE]"
                />
                Mark as Pro-Only Element
              </label>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-2 text-xs text-rose-800">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!name.trim()) {
                    setError("Name is required");
                    return;
                  }
                  setBusy(true);
                  setError(null);
                  try {
                    const res = await fetch("/api/admin/elements", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name,
                        kind: fileFormat === "MP3" || fileFormat === "WAV" || fileFormat === "M4A" ? "MUSIC" : fileFormat === "MP4" || fileFormat === "MOV" || fileFormat === "WEBM" ? "VIDEO" : fileFormat === "SVG" ? "MOTIF" : "IMAGE",
                        category: category.toLowerCase(),
                        file_url: fileUrl || undefined,
                        file_format: fileFormat,
                        is_pro_only: isProOnly,
                        default_props: { url: fileUrl, format: fileFormat },
                      }),
                    });
                    const d = await res.json();
                    if (!res.ok) {
                      setError(d.error ?? "Failed to create element");
                      return;
                    }
                    setItems([d.element, ...items]);
                    setShowAdd(false);
                    setName("");
                    setFileUrl("");
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
                className="rounded-xl bg-[#6520EE] hover:bg-[#5218c5] text-white px-5 py-2 text-xs font-bold shadow-xs transition-colors"
              >
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Element"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

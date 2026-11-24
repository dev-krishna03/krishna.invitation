"use client";

import { useState, useRef } from "react";
import {
  User,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Crown,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface CreatorProfileProps {
  initialUser: {
    id: string;
    email?: string | null;
    name?: string | null;
    avatar_url?: string | null;
    role?: string;
  };
}

const PRESET_AVATARS = [
  {
    name: "Royal Palace Studio",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    label: "👑 Atelier",
  },
  {
    name: "Floral Artisan",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    label: "🌸 Floral",
  },
  {
    name: "Vedic Calligrapher",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    label: "✨ Shahi",
  },
  {
    name: "Minimalist Modern",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80",
    label: "🏛️ Modern",
  },
  {
    name: "Golden Heritage",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    label: "🎨 Heritage",
  },
];

export function CreatorProfileCard({ initialUser }: CreatorProfileProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatar_url || "");
  const [previewUrl, setPreviewUrl] = useState(initialUser.avatar_url || "");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: "error", msg: "Image must be under 8MB" });
      return;
    }

    setFileToUpload(file);
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setFeedback(null);
  }

  function selectPreset(url: string) {
    setFileToUpload(null);
    setAvatarUrl(url);
    setPreviewUrl(url);
  }

  async function handleSave() {
    setBusy(true);
    setFeedback(null);

    try {
      if (fileToUpload) {
        // Multipart upload
        const fd = new FormData();
        fd.append("file", fileToUpload);
        if (name) fd.append("name", name);

        const res = await fetch("/api/workspace/profile/avatar", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to upload avatar");

        setAvatarUrl(data.avatar_url);
        setPreviewUrl(data.avatar_url);
        setFileToUpload(null);
        setFeedback({ type: "success", msg: "Profile photo and details updated!" });
      } else {
        // Direct update
        const res = await fetch("/api/workspace/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatar_url: avatarUrl,
            name,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save profile");

        setFeedback({ type: "success", msg: "Creator profile saved successfully!" });
      }
    } catch (e) {
      setFeedback({
        type: "error",
        msg: e instanceof Error ? e.message : "Error saving profile",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-amber-50/40 p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-rose-100 pb-5">
        <div className="flex items-start gap-4">
          {/* Avatar Preview with Camera Action */}
          <div className="relative group shrink-0">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-rose-400 bg-rose-100 shadow-md">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={name || "Creator"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-600 to-amber-600 font-serif text-2xl font-bold text-white">
                  {(name || initialUser.email || "C").slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
              title="Upload new photo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Creator Identity &amp; Profile Picture
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                <ShieldCheck className="h-3 w-3" />
                Verified Artist
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Your profile picture and studio name appear on all your listed marketplace templates and client quotes.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-2xs self-start"
        >
          <Upload className="h-3.5 w-3.5 text-rose-600" />
          <span>Upload Photo</span>
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Creator Name & Email */}
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
              Studio / Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Royal Wedding Atelier"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-900 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={initialUser.email || ""}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-100 px-3.5 py-2 text-xs text-stone-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">
              Used for payout notifications and order delivery alerts.
            </span>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
              Custom Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://.../avatar.jpg"
              value={avatarUrl}
              onChange={(e) => {
                setAvatarUrl(e.target.value);
                setPreviewUrl(e.target.value);
                setFileToUpload(null);
              }}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-mono text-stone-900 focus:border-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Preset Luxury Studio Avatars */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
            Or Choose A Handcrafted Atelier Avatar
          </label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_AVATARS.map((p) => {
              const isSelected = previewUrl === p.url;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => selectPreset(p.url)}
                  className={`group relative flex flex-col items-center rounded-2xl border p-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/80 shadow-xs"
                      : "border-stone-200 bg-white hover:border-rose-300"
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-11 w-11 rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="mt-1 text-[9px] font-bold text-stone-700 truncate w-full text-center">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-rose-100 bg-white p-3.5 mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
              <Crown className="h-3.5 w-3.5 text-amber-500" />
              <span>Designer Showcase Impact</span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Creators with high-resolution studio profile photos achieve <strong>3.4x higher conversion</strong> on template sales in the community marketplace and bespoke client requests.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`mt-4 rounded-2xl p-3.5 text-xs flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Footer Save Action */}
      <div className="mt-5 pt-4 border-t border-rose-100 flex items-center justify-between">
        <span className="text-[11px] text-stone-500">
          Format supported: SVG, PNG, JPG/JPEG, WebP, GIF (Max 8MB)
        </span>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 px-5 py-2 text-xs font-bold text-white shadow-xs cursor-pointer disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span>Save Profile Changes</span>
        </button>
      </div>
    </div>
  );
}

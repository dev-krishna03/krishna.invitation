"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Store,
  Loader2,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Clock,
  XCircle,
  Image as ImageIcon,
  Upload,
  Eye,
  Trash2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

const CATEGORIES = ["LUXURY", "MINIMAL", "TRADITIONAL", "MODERN", "FLORAL", "RUSTIC"] as const;

export function TemplateEditor({
  template,
  canSell,
  feePct,
}: {
  template: {
    id: string;
    name: string;
    description: string | null;
    thumbnail_url?: string | null;
    preview_url?: string | null;
    category: string;
    event_types: string[];
    is_in_marketplace: boolean;
    price: number | null;
    price_usd: number | null;
    currency: string;
    sales_count: number;
    revenue_total: number;
    moderation_status: string;
    moderation_notes: string | null;
  };
  canSell: boolean;
  feePct: number;
}) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [category, setCategory] = useState(template.category);
  const [eventTypesText, setEventTypesText] = useState(template.event_types.join(", "));
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(template.thumbnail_url ?? "");
  const [priceInr, setPriceInr] = useState<string>(template.price?.toString() ?? "");
  const [priceUsd, setPriceUsd] = useState<string>(template.price_usd?.toString() ?? "");
  const [listed, setListed] = useState(template.is_in_marketplace);
  const [busy, setBusy] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priceInrNum = parseInt(priceInr || "0", 10);
  const priceUsdNum = parseInt(priceUsd || "0", 10);
  const sellerShareInr = priceInrNum > 0 ? Math.round((priceInrNum * (100 - feePct)) / 100) : 0;
  const sellerShareUsd = priceUsdNum > 0 ? Math.round((priceUsdNum * (100 - feePct)) / 100) : 0;
  const status = template.moderation_status;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setError("Template image must be under 15MB");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch(`/api/workspace/templates/${template.id}/upload-cover`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload view image");

      setThumbnailUrl(data.thumbnail_url);
      setSavedAt(`Image uploaded at ${new Date().toLocaleTimeString()}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleRemoveImage() {
    setThumbnailUrl("");
    await fetch(`/api/workspace/templates/${template.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ thumbnail_url: null, preview_url: null }),
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/workspace/templates/${template.id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        category,
        event_types: eventTypesText.split(",").map((s) => s.trim()).filter(Boolean),
        thumbnail_url: thumbnailUrl || null,
        preview_url: thumbnailUrl || null,
        price: priceInr ? priceInrNum : null,
        price_usd: priceUsd ? priceUsdNum : null,
        is_in_marketplace: listed,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      setError(d.error ?? "Failed");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {/* Main Details */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-stone-900">Edit Template</h1>
          <p className="mt-1 text-xs text-stone-500">Metadata that buyers and your invitations will see.</p>

          <div className="mt-5 space-y-4">
            <Field label="Template Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-rose-500 focus:outline-none"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-rose-500 focus:outline-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white text-stone-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Event types (comma-separated slugs)">
                <input
                  value={eventTypesText}
                  onChange={(e) => setEventTypesText(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono text-stone-900"
                />
              </Field>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
            {savedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved {savedAt}
              </span>
            )}
            <motion.button
              onClick={save}
              disabled={busy || !name}
              whileHover={!busy ? { scale: 1.02 } : undefined}
              className="ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-900/15 disabled:opacity-50 cursor-pointer"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {busy ? "Saving…" : "Save changes"}
            </motion.button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>

        {/* TEMPLATE VIEW IMAGE / GRID DISPLAY IMAGE MANAGEMENT */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-rose-600" />
                Template View Image (Grid Display Image)
              </h2>
              <p className="mt-1 text-xs text-stone-500">
                This image represents your template across the public gallery, search results, and invitation selector grids.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Direct Image URL input & Upload buttons */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block">
                  Image URL or Direct Link
                </label>
                <input
                  type="text"
                  placeholder="https://.../cover.png or /uploads/..."
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-900 placeholder:text-stone-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 px-4 py-2 text-xs font-semibold text-stone-700 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-600" />
                  ) : (
                    <Upload className="h-3.5 w-3.5 text-rose-600" />
                  )}
                  <span>Upload Image File</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/webm"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {thumbnailUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove view image"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 text-stone-400 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <span className="text-[10px] text-stone-400 block leading-relaxed">
                Recommended aspect ratio: <strong>4:5 portrait (e.g. 800x1000px)</strong>. Formats supported: SVG, PNG, JPG/JPEG, WebP, GIF, WebM (Max 15MB).
              </span>
            </div>

            {/* Live Card Preview Box */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2.5">
                Live Grid Card Preview
              </span>
              <div className="relative w-44 aspect-[4/5] rounded-2xl overflow-hidden border border-[#E5D9FC] bg-white shadow-md flex flex-col justify-between p-3 group">
                {thumbnailUrl ? (
                  <>
                    <img
                      src={thumbnailUrl}
                      alt={name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="rounded-full bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6520EE]">
                        {category}
                      </span>
                    </div>
                    <div className="relative z-10 text-white">
                      <p className="font-bold text-xs truncate drop-shadow-xs">{name}</p>
                      <p className="text-[10px] opacity-80 truncate">
                        {priceInr ? `₹${priceInrNum.toLocaleString()}` : "Free"}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-center p-3">
                    <ImageIcon className="h-8 w-8 text-stone-300" />
                    <span className="mt-2 text-[10px] text-stone-400">No view image set</span>
                    <span className="text-[9px] text-rose-600 font-semibold mt-0.5">
                      Upload an image above
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        {/* Marketplace Settings */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="inline-flex items-center gap-2 font-serif text-base font-bold text-stone-900">
            <Store className="h-4 w-4" /> Marketplace Listing
          </h3>
          {!canSell && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <Lock className="mt-0.5 h-3.5 w-3.5" />
              <span>
                Your current plan doesn&apos;t allow selling. Upgrade on the{" "}
                <a href="/dashboard/plan" className="font-bold underline">
                  plans
                </a>{" "}
                page.
              </span>
            </div>
          )}

          <ModerationBadge status={status} notes={template.moderation_notes} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-stone-500">
                Price (INR)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-stone-500">₹</span>
                <input
                  type="number"
                  min={0}
                  value={priceInr}
                  onChange={(e) => setPriceInr(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              {priceInrNum > 0 && (
                <p className="mt-1 text-[11px] text-stone-500">
                  You keep <span className="font-bold text-emerald-700">₹{sellerShareInr.toLocaleString()}</span>
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-stone-500">
                Price (USD)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-stone-500">$</span>
                <input
                  type="number"
                  min={0}
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                />
              </div>
              {priceUsdNum > 0 && (
                <p className="mt-1 text-[11px] text-stone-500">
                  You keep <span className="font-bold text-emerald-700">${sellerShareUsd.toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
          <p className="mt-2 text-[11px] text-stone-500">
            Buyers see price in their preferred currency. Set at least one; the other will convert automatically.
          </p>

          <label className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs">
            <span>
              <p className="font-bold text-stone-900">Submit to marketplace</p>
              <p className="text-[11px] text-stone-500">
                Enabling this submits your template for moderation.
              </p>
            </span>
            <input
              type="checkbox"
              disabled={!canSell}
              checked={listed}
              onChange={(e) => setListed(e.target.checked)}
              className="h-4 w-4 rounded-md border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
            />
          </label>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-stone-700">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function ModerationBadge({ status, notes }: { status: string; notes: string | null }) {
  if (status === "APPROVED") {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>Approved and live in the community marketplace.</span>
      </div>
    );
  }
  if (status === "REJECTED") {
    return (
      <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-800">
        <div className="flex items-center gap-1.5 font-bold">
          <XCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>Needs changes</span>
        </div>
        {notes && <p className="mt-1 text-[11px] opacity-90">{notes}</p>}
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800">
      <Clock className="h-4 w-4 text-amber-600 shrink-0" />
      <span>Pending super admin review</span>
    </div>
  );
}

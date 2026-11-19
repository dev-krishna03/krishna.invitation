"use client";

import { useState, useRef, useEffect, useId } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Palette,
  Type,
  Sparkles,
  Music,
  Image as ImageIcon,
  Layers,
  Play,
  Pause,
  Download,
  Share2,
  Check,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  RotateCcw,
  Bold,
  Italic,
  Underline,
  Lock,
  Unlock,
  Copy,
  MoveUp,
  MoveDown,
  Pipette,
  Minus,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from "lucide-react";

export type ElementType = {
  id: string;
  type: "ganesha" | "heading" | "names" | "divider" | "message" | "button" | "details";
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight?: number;
  color: string;
  animation: "none" | "shimmer" | "pulse" | "float" | "bounce";
  align: "left" | "center" | "right";
  letterSpacing?: number;
  lineHeight?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isUppercase?: boolean;
  opacity?: number;
  rotation?: number;
  shadowEffect?: "none" | "glow" | "gold" | "shadow" | "lift";
  isLocked?: boolean;
};

const TEMPLATE_PRESETS = [
  {
    id: "rose-invitation",
    name: "Rose Garden Royal",
    bg: "from-[#FBF2E8] via-[#FAF3EA] to-[#F2DCC8]",
    themeColor: "#881337",
    borderColor: "#d97706",
    song: "/audio/presets/shehnai-wedding.wav",
    songName: "Kudmayi • Royal Shehnai",
    tag: "Most Popular",
  },
  {
    id: "royal-elegance",
    name: "Imperial Wine & Gold",
    bg: "from-[#4A0E17] via-[#7B1123] to-[#991B1B]",
    themeColor: "#fef3c7",
    borderColor: "#f59e0b",
    song: "/audio/presets/shubh-mangalam.wav",
    songName: "Shubh Vivah Mangalam",
    tag: "Luxury",
  },
  {
    id: "minimal-love",
    name: "Sage Minimalist Love",
    bg: "from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0]",
    themeColor: "#1e293b",
    borderColor: "#94a3b8",
    song: "/audio/presets/sitar-flute.wav",
    songName: "Acoustic Sitar & Flute",
    tag: "Modern",
  },
  {
    id: "auspicious-marigold",
    name: "Auspicious Marigold Haldi",
    bg: "from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]",
    themeColor: "#78350f",
    borderColor: "#b45309",
    song: "/audio/presets/sacred-chimes.wav",
    songName: "Sacred Temple Bells",
    tag: "Festive",
  },
];

const SONG_PRESETS = [
  { name: "Kudmayi • Royal Shehnai", url: "/audio/presets/shehnai-wedding.wav" },
  { name: "Shubh Vivah Mangalam", url: "/audio/presets/shubh-mangalam.wav" },
  { name: "Acoustic Sitar & Flute", url: "/audio/presets/sitar-flute.wav" },
  { name: "Sacred Temple Chimes", url: "/audio/presets/sacred-chimes.wav" },
];

const FONT_OPTIONS = [
  { name: "Playfair Display", label: "Playfair Display (Royal Serif)" },
  { name: "Poppins", label: "Poppins (Modern Clean)" },
  { name: "Cinzel", label: "Cinzel (Imperial Classical)" },
  { name: "Cormorant Garamond", label: "Cormorant (Elegant Heritage)" },
  { name: "Georgia", label: "Georgia (Timeless Book)" },
];

const ROYAL_PALETTES = [
  {
    name: "Imperial Golds & Amber",
    colors: ["#D97706", "#B45309", "#F59E0B", "#FDE68A", "#78350F"],
  },
  {
    name: "Royal Celebration Jewels",
    colors: ["#881337", "#991B1B", "#047857", "#0F766E", "#1E3A8A", "#6B21A8"],
  },
  {
    name: "Monochrome & Silk Ivory",
    colors: ["#1C1917", "#44403C", "#78716C", "#FAF5EB", "#FFFFFF"],
  },
];

export function CanvaInvitationEditor() {
  const [activeTab, setActiveTab] = useState<"templates" | "text" | "elements" | "music" | "animations" | "background">("text");
  const [title, setTitle] = useState("Aarav & Priya • Royal Wedding Card");
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const colorPickerInputId = useId();

  // Selected template aesthetic
  const [currentTemplate, setCurrentTemplate] = useState(TEMPLATE_PRESETS[0]);
  const [selectedSong, setSelectedSong] = useState(SONG_PRESETS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Atmospheric particle effects
  const [screenEffect, setScreenEffect] = useState<"petals" | "sparkles" | "none">("petals");

  // Elements on the Canvas
  const [elements, setElements] = useState<ElementType[]>([
    {
      id: "ganesha-1",
      type: "ganesha",
      content: "श्री गणेशाय नमः",
      fontFamily: "Playfair Display",
      fontSize: 22,
      fontWeight: 700,
      color: "#92400e",
      animation: "float",
      align: "center",
      letterSpacing: 2,
      lineHeight: 1.3,
      opacity: 100,
      rotation: 0,
      shadowEffect: "gold",
      isLocked: false,
    },
    {
      id: "divider-1",
      type: "divider",
      content: "🌹",
      fontFamily: "sans-serif",
      fontSize: 18,
      fontWeight: 400,
      color: "#b45309",
      animation: "shimmer",
      align: "center",
      letterSpacing: 0,
      lineHeight: 1.2,
      opacity: 100,
      rotation: 0,
      shadowEffect: "none",
      isLocked: false,
    },
    {
      id: "message-1",
      type: "message",
      content: "We cordially invite you to grace the auspicious occasion of the marriage of...",
      fontFamily: "Playfair Display",
      fontSize: 14,
      fontWeight: 400,
      color: "#44403c",
      animation: "none",
      align: "center",
      letterSpacing: 0.5,
      lineHeight: 1.5,
      isItalic: true,
      opacity: 90,
      rotation: 0,
      shadowEffect: "none",
      isLocked: false,
    },
    {
      id: "names-1",
      type: "names",
      content: "Aarav Mehta & Priya Sharma",
      fontFamily: "Playfair Display",
      fontSize: 28,
      fontWeight: 700,
      color: "#1c1917",
      animation: "pulse",
      align: "center",
      letterSpacing: 1,
      lineHeight: 1.25,
      isBold: true,
      opacity: 100,
      rotation: 0,
      shadowEffect: "glow",
      isLocked: false,
    },
    {
      id: "button-1",
      type: "button",
      content: "Tap to open",
      fontFamily: "Poppins",
      fontSize: 13,
      fontWeight: 600,
      color: "#78350f",
      animation: "pulse",
      align: "center",
      letterSpacing: 1.5,
      lineHeight: 1.2,
      isUppercase: false,
      opacity: 100,
      rotation: 0,
      shadowEffect: "none",
      isLocked: false,
    },
  ]);

  const [selectedElementId, setSelectedElementId] = useState<string>("names-1");
  const selectedElement = elements.find((e) => e.id === selectedElementId);

  // Auto collect document colors
  const documentColors = Array.from(
    new Set([
      currentTemplate.themeColor,
      currentTemplate.borderColor,
      ...elements.map((el) => el.color),
    ])
  ).filter(Boolean);

  // Toggle Audio
  function toggleAudio() {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  }

  // Update selected element property
  function updateSelected(field: keyof ElementType, val: unknown) {
    if (!selectedElementId) return;
    setElements((prev) =>
      prev.map((el) => {
        if (el.id === selectedElementId) {
          if (el.isLocked && field !== "isLocked") return el;
          return { ...el, [field]: val };
        }
        return el;
      })
    );
  }

  // Add new element
  function addElement(type: ElementType["type"], content: string) {
    const newEl: ElementType = {
      id: `${type}-${Date.now()}`,
      type,
      content,
      fontFamily: type === "ganesha" ? "Playfair Display" : "Poppins",
      fontSize: type === "heading" ? 24 : type === "divider" ? 20 : 15,
      fontWeight: type === "heading" ? 700 : 400,
      color: currentTemplate.themeColor,
      animation: "shimmer",
      align: "center",
      letterSpacing: 0,
      lineHeight: 1.4,
      opacity: 100,
      rotation: 0,
      shadowEffect: "none",
      isLocked: false,
    };
    setElements([...elements, newEl]);
    setSelectedElementId(newEl.id);
  }

  // Duplicate element
  function duplicateElement(id: string) {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const newEl: ElementType = {
      ...el,
      id: `${el.type}-${Date.now()}`,
      content: `${el.content} (Copy)`,
      isLocked: false,
    };
    const index = elements.findIndex((e) => e.id === id);
    const newElements = [...elements];
    newElements.splice(index + 1, 0, newEl);
    setElements(newElements);
    setSelectedElementId(newEl.id);
  }

  // Layer order changes
  function moveLayer(id: string, direction: "up" | "down" | "top" | "bottom") {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx === -1) return;
    const newArr = [...elements];
    const item = newArr.splice(idx, 1)[0];

    if (direction === "up" && idx > 0) {
      newArr.splice(idx - 1, 0, item);
    } else if (direction === "down" && idx < elements.length - 1) {
      newArr.splice(idx + 1, 0, item);
    } else if (direction === "top") {
      newArr.unshift(item);
    } else if (direction === "bottom") {
      newArr.push(item);
    } else {
      newArr.splice(idx, 0, item);
    }
    setElements(newArr);
  }

  // Delete element
  function deleteElement(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedElementId === id) {
      const remaining = elements.filter((e) => e.id !== id);
      setSelectedElementId(remaining[0]?.id ?? "");
    }
  }

  // Helpers for text shadow styling
  function getShadowCss(shadowEffect?: string) {
    switch (shadowEffect) {
      case "glow":
        return "0 0 16px rgba(234, 179, 8, 0.65)";
      case "gold":
        return "0 2px 8px rgba(180, 83, 9, 0.6), 0 0 2px rgba(251, 191, 36, 0.9)";
      case "shadow":
        return "0 4px 10px rgba(0, 0, 0, 0.35)";
      case "lift":
        return "0 8px 20px rgba(0, 0, 0, 0.25)";
      default:
        return "none";
    }
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white text-stone-900 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={selectedSong.url}
        loop
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
      />

      {/* ================= 1. CLEAN WHITE CANVA APP BAR ================= */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-xs z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/company"
            className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="h-5 w-px bg-stone-200" />

          {/* Editable Document Title */}
          <div className="flex items-center gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-serif text-sm font-bold text-stone-900 hover:bg-stone-50 focus:bg-white focus:border-purple-400 border border-transparent rounded px-2.5 py-1 max-w-[220px] sm:max-w-md truncate outline-none"
            />
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Check className="h-3 w-3" />
              <span>Autosaved</span>
            </span>
          </div>
        </div>

        {/* Center: Device Viewport Switcher & Zoom */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-stone-100 p-1 border border-stone-200">
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "mobile"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Guest Card</span>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "desktop"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop View</span>
            </button>
          </div>

          {/* Canvas Zoom controls */}
          <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 px-2 py-0.5 text-xs text-stone-600 gap-1.5">
            <button
              onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
              className="hover:text-stone-900 p-0.5"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[11px] font-semibold w-9 text-center">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
              className="hover:text-stone-900 p-0.5"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Audio toggle button in header */}
          <button
            onClick={toggleAudio}
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl border transition-colors ${
              isPlayingAudio
                ? "bg-rose-600 text-white border-rose-500 animate-pulse shadow-xs"
                : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
            }`}
            title={isPlayingAudio ? "Mute Background Music" : "Play Background Music"}
          >
            {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Test Live Guest Animation */}
          <button
            onClick={() => setIsLivePreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors shadow-xs cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 fill-current text-purple-700" />
            <span>Test Animation</span>
          </button>

          {/* Publish CTA */}
          <button
            onClick={() => alert("🎉 Invitation template design saved and published to client dashboard!")}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition-all cursor-pointer"
          >
            <span>Publish Design</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN 3-COLUMN STUDIO LAYOUT ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* ================= 2. LEFT SIDEBAR (WHITE) ================= */}
        {/* Sub-bar 2A: Icon rail */}
        <aside className="w-18 shrink-0 border-r border-stone-200 bg-white flex flex-col items-center py-3 gap-2.5 z-20 shadow-xs">
          {[
            { id: "templates", label: "Themes", icon: Palette },
            { id: "text", label: "Text", icon: Type },
            { id: "elements", label: "Elements", icon: Sparkles },
            { id: "animations", label: "FX & Anim", icon: Sliders },
            { id: "music", label: "Music", icon: Music },
            { id: "background", label: "Canvas", icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-50 text-purple-700 font-bold border border-purple-200 shadow-xs"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-900 font-medium"
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? "text-purple-700" : "text-stone-500"}`} />
                <span className="mt-1 text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Sub-bar 2B: White Slide-out Drawer Panel */}
        <aside className="w-72 shrink-0 border-r border-stone-200 bg-white p-4 overflow-y-auto z-10 shadow-xs">
          {/* TAB 1: TEMPLATES */}
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Palette className="h-4 w-4 text-purple-600" />
                  <span>Royal Template Presets</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Select a handcrafted celebratory wedding theme.
                </p>
              </div>

              <div className="space-y-3">
                {TEMPLATE_PRESETS.map((tmpl) => {
                  const isCur = currentTemplate.id === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => setCurrentTemplate(tmpl)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition-all text-left ${
                        isCur
                          ? "bg-purple-50 border-purple-400 ring-2 ring-purple-300 shadow-xs"
                          : "bg-stone-50/80 border-stone-200 hover:border-purple-300 hover:bg-stone-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-xs font-bold text-stone-900">{tmpl.name}</span>
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          {tmpl.tag}
                        </span>
                      </div>
                      <div className="mt-2.5 h-12 w-full rounded-xl bg-gradient-to-r shadow-inner border border-amber-300/40 relative overflow-hidden"
                        style={{
                          backgroundImage: tmpl.id === "rose-invitation" 
                            ? "linear-gradient(to right, #FBF2E8, #FAF3EA, #F2DCC8)" 
                            : tmpl.id === "royal-elegance" 
                            ? "linear-gradient(to right, #4A0E17, #7B1123, #991B1B)"
                            : tmpl.id === "minimal-love"
                            ? "linear-gradient(to right, #E2E8F0, #F1F5F9, #E2E8F0)"
                            : "linear-gradient(to right, #FEF3C7, #FDE68A, #FCD34D)",
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-serif opacity-80"
                          style={{ color: tmpl.themeColor }}
                        >
                          श्री गणेशाय नमः
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-stone-500 flex items-center gap-1 truncate">
                        <Music className="h-3 w-3 text-purple-600" />
                        <span>{tmpl.songName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: TEXT ELEMENTS */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Type className="h-4 w-4 text-purple-600" />
                  <span>Typography & Text Elements</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Click to add celebratory calligraphy or detail elements to your invitation.
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => addElement("heading", "शुभ विवाह निमंत्रण")}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer"
                >
                  <span className="font-serif text-base font-bold text-stone-900 block">
                    Add Royal Heading
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Auspicious Shubh Vivah, Shubh Vivah Mangalam
                  </span>
                </button>

                <button
                  onClick={() => addElement("names", "Couple Names")}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer"
                >
                  <span className="font-serif text-sm font-bold text-stone-800 block">
                    Add Bride & Groom Names
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Grand script styling with animated heartbeat
                  </span>
                </button>

                <button
                  onClick={() => addElement("message", "We cordially invite you to join our auspicious celebration...")}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-800 block">
                    Add Invitation Message Body
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Warm cordial prose with custom spacing
                  </span>
                </button>

                <button
                  onClick={() => addElement("details", "Muhurat: 7:00 PM • Imperial Palace Grounds")}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-stone-800 block">
                    Add Ceremony Date & Venue
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Event schedule, Muhurat timing, and location
                  </span>
                </button>

                <button
                  onClick={() => addElement("button", "View Ceremony Details")}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-purple-700 block">
                    + Add Interactive Interactive CTA
                  </span>
                  <span className="text-[11px] text-stone-500">
                    &apos;Tap to open&apos; card flip trigger button
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ELEMENTS & MOTIFS */}
          {activeTab === "elements" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>Sacred Motifs & Ornaments</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Click any auspicious motif to add directly onto the card canvas.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Rose Divider", icon: "🌹", type: "divider" as const },
                  { label: "Om Symbol", icon: "ॐ", type: "ganesha" as const },
                  { label: "Shubh Vivah", icon: "॥ शुभ विवाह ॥", type: "heading" as const },
                  { label: "Diya Lamp", icon: "🪔", type: "divider" as const },
                  { label: "Mandala Motif", icon: "❂", type: "divider" as const },
                  { label: "Wedding Rings", icon: "💍", type: "divider" as const },
                  { label: "Golden Lotus", icon: "🪷", type: "divider" as const },
                  { label: "Temple Chimes", icon: "🔔", type: "divider" as const },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => addElement(item.type, item.icon)}
                    className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-center hover:border-purple-400 hover:bg-purple-50/30 transition-all cursor-pointer"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="mt-1 text-[11px] font-semibold text-stone-800">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ANIMATIONS & SCREEN EFFECTS */}
          {activeTab === "animations" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-rose-600" />
                  <span>Animation & Visual FX Studio</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Add magical celebration animations to elements and ambient particles.
                </p>
              </div>

              {/* Screen Particle Effects */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 space-y-2">
                <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Atmospheric Screen Effect
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "petals", label: "Rose Petals 🌸" },
                    { id: "sparkles", label: "Sparkles ✨" },
                    { id: "none", label: "Clean / Off" },
                  ].map((fx) => (
                    <button
                      key={fx.id}
                      onClick={() => setScreenEffect(fx.id as typeof screenEffect)}
                      className={`rounded-lg py-1.5 text-[11px] font-semibold border transition-all cursor-pointer ${
                        screenEffect === fx.id
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {fx.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Element Animation triggers for selected element */}
              <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 space-y-2.5">
                <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Selected Item Animation ({selectedElement?.type ?? "Select Item"})
                </label>
                <p className="text-[11px] text-stone-500">
                  Choose how this element animates when your guests open the card:
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "shimmer", label: "Golden Shimmer ✨" },
                    { id: "pulse", label: "Heartbeat Pulse 💓" },
                    { id: "float", label: "Floating Sway 🍃" },
                    { id: "bounce", label: "Spring Bounce 🎈" },
                    { id: "none", label: "Static None" },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => updateSelected("animation", anim.id)}
                      className={`rounded-xl p-2 text-xs font-semibold border text-center transition-all cursor-pointer ${
                        selectedElement?.animation === anim.id
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100 hover:border-purple-300"
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Preview trigger */}
              <button
                onClick={() => setIsLivePreviewOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Simulate Full Guest Unfolding</span>
              </button>
            </div>
          )}

          {/* TAB 5: MUSIC & AUDIO */}
          {activeTab === "music" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Music className="h-4 w-4 text-amber-600" />
                  <span>Celebration Soundtrack</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">
                  Plays automatically or on &quot;Tap to open&quot; as guests view the card.
                </p>
              </div>

              <div className="space-y-2">
                {SONG_PRESETS.map((song) => {
                  const isCur = selectedSong.url === song.url;
                  return (
                    <div
                      key={song.url}
                      onClick={() => {
                        setSelectedSong(song);
                        if (audioRef.current) {
                          audioRef.current.src = song.url;
                          audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
                        }
                      }}
                      className={`cursor-pointer flex items-center justify-between rounded-xl p-3 border transition-all ${
                        isCur
                          ? "bg-purple-50 border-purple-400 text-purple-900 ring-1 ring-purple-300"
                          : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-white"
                      }`}
                    >
                      <span className="text-xs font-semibold truncate pr-2">{song.name}</span>
                      {isCur && <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {/* Audio controller */}
              <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-center">
                <div className="text-xs font-bold text-stone-900">{selectedSong.name}</div>
                <button
                  onClick={toggleAudio}
                  className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{isPlayingAudio ? "Pause Audio" : "Play Sound"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: BACKGROUND & BORDERS */}
          {activeTab === "background" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-purple-600" />
                  <span>Card Aesthetics</span>
                </h3>
                <p className="mt-1 text-xs text-stone-500">Configure background gradients and gold border accents.</p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Palace Garden Ivory", bg: "from-[#FBF2E8] via-[#FAF3EA] to-[#F2DCC8]" },
                  { label: "Imperial Wine Velvet", bg: "from-[#4A0E17] via-[#7B1123] to-[#991B1B]" },
                  { label: "Sage Pearl Minimal", bg: "from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0]" },
                  { label: "Auspicious Marigold", bg: "from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]" },
                ].map((bgItem, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTemplate({ ...currentTemplate, bg: bgItem.bg })}
                    className="w-full flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-left hover:border-purple-400 hover:bg-white transition-all cursor-pointer"
                  >
                    <span className={`h-8 w-12 rounded-lg bg-gradient-to-r ${bgItem.bg} border border-amber-300/60 shrink-0 shadow-xs`} />
                    <span className="text-xs font-semibold text-stone-800">{bgItem.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ================= 3. CENTER CANVAS (CLEAN STUDIO LIGHT WORKSPACE) ================= */}
        <main className="relative flex-1 overflow-auto bg-[#F4F5F7] p-6 flex flex-col items-center justify-center">
          {/* Subtle Dotted Grid Texture */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Canvas Floating Petals Effect */}
          {screenEffect === "petals" && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
              {[15, 30, 45, 60, 75, 90].map((left, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: "100%", opacity: [0, 0.85, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 5 + idx * 0.8,
                    delay: idx * 0.7,
                    ease: "linear",
                  }}
                  style={{ left: `${left}%` }}
                  className="absolute text-rose-300/80 text-lg select-none"
                >
                  🌸
                </motion.div>
              ))}
            </div>
          )}

          {/* Canvas Viewport Frame with zoom scale */}
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
            className={`transition-transform duration-200 relative ${
              viewMode === "mobile" ? "w-[390px]" : "w-[680px]"
            }`}
          >
            {/* Hanging Cord simulation on top */}
            <div className="flex justify-between px-16 -mb-2 relative z-0">
              <div className="w-0.5 h-6 bg-gradient-to-b from-stone-400 to-amber-700 shadow-xs" />
              <div className="w-0.5 h-6 bg-gradient-to-b from-stone-400 to-amber-700 shadow-xs" />
            </div>

            {/* The Actual Card Canvas with clean luxury shadow */}
            <div
              className={`relative rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b ${currentTemplate.bg} p-8 text-center shadow-2xl shadow-stone-400/30 backdrop-blur-md overflow-hidden transition-all`}
            >
              {/* Filigree Corner Accents */}
              <div className="absolute top-3 left-3 text-amber-600/60 text-xs select-none">✦</div>
              <div className="absolute top-3 right-3 text-amber-600/60 text-xs select-none">✦</div>
              <div className="absolute bottom-3 left-3 text-amber-600/60 text-xs select-none">✦</div>
              <div className="absolute bottom-3 right-3 text-amber-600/60 text-xs select-none">✦</div>

              {/* Elements List Rendered Live on Canvas */}
              <div className="space-y-4">
                {elements.map((el) => {
                  const isSelected = selectedElementId === el.id;

                  // Animation classes
                  let animClass = "";
                  if (el.animation === "shimmer") animClass = "shimmer-text";
                  if (el.animation === "pulse") animClass = "animate-pulse";
                  if (el.animation === "float") animClass = "animate-float-slow";

                  // Dynamic inline styling
                  const style: React.CSSProperties = {
                    fontFamily: el.fontFamily,
                    fontSize: `${el.fontSize}px`,
                    fontWeight: el.isBold ? 700 : (el.fontWeight || 400),
                    fontStyle: el.isItalic ? "italic" : "normal",
                    textDecoration: el.isUnderline ? "underline" : "none",
                    textTransform: el.isUppercase ? "uppercase" : "none",
                    letterSpacing: `${el.letterSpacing ?? 0}px`,
                    lineHeight: el.lineHeight ?? 1.4,
                    color: el.color,
                    opacity: (el.opacity ?? 100) / 100,
                    transform: `rotate(${el.rotation ?? 0}deg)`,
                    textAlign: el.align || "center",
                    textShadow: getShadowCss(el.shadowEffect),
                  };

                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`group relative cursor-pointer rounded-xl p-2 transition-all ${
                        isSelected
                          ? "ring-2 ring-purple-600 bg-purple-500/10 shadow-sm"
                          : "hover:ring-1 hover:ring-amber-400/60"
                      }`}
                    >
                      {/* Canva-Style Selection Bounding Box with Corner Dots and Floating Toolbar */}
                      {isSelected && (
                        <>
                          {/* 4 Corner Resize Dots */}
                          <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-purple-600 shadow-xs z-20" />
                          <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-purple-600 shadow-xs z-20" />
                          <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-purple-600 shadow-xs z-20" />
                          <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-purple-600 shadow-xs z-20" />

                          {/* CANVA QUICK FLOATING MINI-TOOLBAR DIRECTLY ABOVE ELEMENT */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute -top-11 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-2 py-1 shadow-lg z-30 text-stone-700 animate-in fade-in duration-150"
                          >
                            {/* Font Size Steppers */}
                            <button
                              onClick={() => updateSelected("fontSize", Math.max(8, el.fontSize - 1))}
                              className="rounded p-1 hover:bg-stone-100 text-stone-600"
                              title="Decrease font size"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-mono text-[11px] font-bold px-1 text-purple-700">
                              {el.fontSize}
                            </span>
                            <button
                              onClick={() => updateSelected("fontSize", Math.min(64, el.fontSize + 1))}
                              className="rounded p-1 hover:bg-stone-100 text-stone-600"
                              title="Increase font size"
                            >
                              <Plus className="h-3 w-3" />
                            </button>

                            <div className="h-3 w-px bg-stone-200 mx-0.5" />

                            {/* Color Swatch / Quick Picker */}
                            <label className="relative cursor-pointer flex items-center p-0.5 rounded hover:bg-stone-100" title="Change Color">
                              <span
                                style={{ backgroundColor: el.color }}
                                className="h-4 w-4 rounded-full border border-stone-300 shadow-xs block"
                              />
                              <input
                                type="color"
                                value={el.color}
                                onChange={(e) => updateSelected("color", e.target.value)}
                                className="sr-only"
                              />
                            </label>

                            <div className="h-3 w-px bg-stone-200 mx-0.5" />

                            {/* Bold, Italic, Underline */}
                            <button
                              onClick={() => updateSelected("isBold", !el.isBold)}
                              className={`rounded p-1 hover:bg-stone-100 ${el.isBold ? "text-purple-700 bg-purple-50" : "text-stone-600"}`}
                              title="Bold"
                            >
                              <Bold className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => updateSelected("isItalic", !el.isItalic)}
                              className={`rounded p-1 hover:bg-stone-100 ${el.isItalic ? "text-purple-700 bg-purple-50" : "text-stone-600"}`}
                              title="Italic"
                            >
                              <Italic className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => updateSelected("isUnderline", !el.isUnderline)}
                              className={`rounded p-1 hover:bg-stone-100 ${el.isUnderline ? "text-purple-700 bg-purple-50" : "text-stone-600"}`}
                              title="Underline"
                            >
                              <Underline className="h-3 w-3" />
                            </button>

                            <div className="h-3 w-px bg-stone-200 mx-0.5" />

                            {/* Duplicate */}
                            <button
                              onClick={() => duplicateElement(el.id)}
                              className="rounded p-1 hover:bg-stone-100 text-stone-600"
                              title="Duplicate element"
                            >
                              <Copy className="h-3 w-3" />
                            </button>

                            {/* Lock */}
                            <button
                              onClick={() => updateSelected("isLocked", !el.isLocked)}
                              className={`rounded p-1 hover:bg-stone-100 ${el.isLocked ? "text-amber-600 bg-amber-50" : "text-stone-600"}`}
                              title={el.isLocked ? "Unlock element" : "Lock element"}
                            >
                              {el.isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => deleteElement(el.id)}
                              className="rounded p-1 hover:bg-rose-50 text-rose-600"
                              title="Delete element"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </>
                      )}

                      {/* Element content rendering */}
                      {el.type === "ganesha" && (
                        <div className="flex flex-col items-center">
                          <svg
                            viewBox="0 0 100 100"
                            className={`h-12 w-12 text-amber-700 drop-shadow-xs fill-none stroke-current ${animClass}`}
                            strokeWidth="2.5"
                          >
                            <path d="M 50 15 Q 50 22 50 30" />
                            <circle cx="50" cy="18" r="2" fill="currentColor" />
                            <path d="M 45 28 C 30 28 25 40 32 50 C 37 57 44 56 46 54" />
                            <path d="M 55 28 C 70 28 75 40 68 50 C 63 57 56 56 54 54" />
                            <path d="M 47 40 C 47 55 45 68 55 72 C 60 74 62 68 58 64" />
                            <path d="M 45 25 Q 50 22 55 25" />
                          </svg>
                          <h4 style={style} className={`mt-1 font-bold ${animClass}`}>
                            {el.content}
                          </h4>
                        </div>
                      )}

                      {el.type === "divider" && (
                        <div className="my-1 flex items-center justify-center gap-3">
                          <span className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400 to-amber-700" />
                          <span style={style} className={`${animClass}`}>{el.content}</span>
                          <span className="h-px w-12 bg-gradient-to-l from-transparent via-amber-400 to-amber-700" />
                        </div>
                      )}

                      {el.type === "heading" && (
                        <h2 style={style} className={`font-serif ${animClass}`}>
                          {el.content}
                        </h2>
                      )}

                      {el.type === "message" && (
                        <p style={style} className={`max-w-sm mx-auto ${animClass}`}>
                          {el.content}
                        </p>
                      )}

                      {el.type === "names" && (
                        <h3 style={style} className={`font-serif tracking-tight ${animClass}`}>
                          {el.content}
                        </h3>
                      )}

                      {el.type === "button" && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsLivePreviewOpen(true);
                            }}
                            style={style}
                            className={`inline-flex items-center justify-center rounded-full border-2 border-amber-500/80 bg-white/90 px-7 py-2.5 shadow-xs hover:bg-white hover:border-amber-600 transition-all ${animClass}`}
                          >
                            <span>{el.content}</span>
                          </button>
                        </div>
                      )}

                      {el.type === "details" && (
                        <p style={style} className={`${animClass}`}>
                          {el.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>

        {/* ================= 4. ADVANCED CANVA-STYLE ELEMENT INSPECTOR (WHITE) ================= */}
        <aside className="w-88 shrink-0 border-l border-stone-200 bg-white p-4 overflow-y-auto z-10 space-y-5 shadow-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-purple-600" />
              <h4 className="font-serif text-sm font-bold text-stone-900">
                Element Inspector
              </h4>
              {selectedElement && (
                <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                  {selectedElement.type}
                </span>
              )}
            </div>

            {selectedElement && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateSelected("isLocked", !selectedElement.isLocked)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    selectedElement.isLocked
                      ? "bg-amber-50 border-amber-300 text-amber-700"
                      : "border-stone-200 text-stone-500 hover:bg-stone-100"
                  }`}
                  title={selectedElement.isLocked ? "Unlock Element" : "Lock Element"}
                >
                  {selectedElement.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => duplicateElement(selectedElement.id)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-100 transition-colors"
                  title="Duplicate Element"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteElement(selectedElement.id)}
                  className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                  title="Delete Element"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {selectedElement ? (
            <div className="space-y-5">
              {/* Lock Alert Banner if locked */}
              {selectedElement.isLocked && (
                <div className="flex items-center justify-between rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Element is locked</span>
                  </div>
                  <button
                    onClick={() => updateSelected("isLocked", false)}
                    className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    Unlock
                  </button>
                </div>
              )}

              {/* 1. TEXT CONTENT SECTION */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Text Content
                </label>
                <textarea
                  rows={2}
                  disabled={selectedElement.isLocked}
                  value={selectedElement.content}
                  onChange={(e) => updateSelected("content", e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-purple-500 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* 2. ADVANCED COLOR PALETTE & COLOR PICKER */}
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-purple-600" />
                    <span>Color Palette</span>
                  </label>
                  {/* Current Active Color Badge */}
                  <div className="flex items-center gap-1.5">
                    <span
                      style={{ backgroundColor: selectedElement.color }}
                      className="h-4 w-4 rounded-full border border-stone-300 shadow-xs inline-block"
                    />
                    <span className="font-mono text-[11px] font-bold text-stone-700 uppercase">
                      {selectedElement.color}
                    </span>
                  </div>
                </div>

                {/* Native Color Picker Trigger + Hex Code Field */}
                <div className="flex items-center gap-2">
                  {/* Visual Rainbow / Pipette trigger for native color picker */}
                  <label
                    htmlFor={colorPickerInputId}
                    className="relative flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 hover:border-purple-400 hover:bg-stone-50 cursor-pointer shadow-xs transition-all"
                  >
                    <span
                      style={{ backgroundColor: selectedElement.color }}
                      className="h-4 w-4 rounded-md border border-stone-300 shadow-inner"
                    />
                    <Pipette className="h-3.5 w-3.5 text-purple-600" />
                    <span>Color Picker</span>
                    <input
                      id={colorPickerInputId}
                      type="color"
                      disabled={selectedElement.isLocked}
                      value={selectedElement.color.startsWith("#") ? selectedElement.color : "#881337"}
                      onChange={(e) => updateSelected("color", e.target.value)}
                      className="sr-only"
                    />
                  </label>

                  {/* Manual Hex Input */}
                  <div className="flex-1 flex items-center rounded-xl border border-stone-200 bg-white px-2.5 py-1 text-xs">
                    <span className="text-stone-400 font-mono font-bold mr-1">#</span>
                    <input
                      type="text"
                      maxLength={7}
                      disabled={selectedElement.isLocked}
                      value={selectedElement.color.replace("#", "")}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, "");
                        updateSelected("color", `#${val}`);
                      }}
                      className="w-full font-mono text-xs font-bold text-stone-900 bg-transparent focus:outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Document Colors (Canva style) */}
                {documentColors.length > 0 && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                      Document Colors
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {documentColors.map((color, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={selectedElement.isLocked}
                          onClick={() => updateSelected("color", color)}
                          style={{ backgroundColor: color }}
                          className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                            selectedElement.color.toLowerCase() === color.toLowerCase()
                              ? "border-purple-600 scale-115 ring-2 ring-purple-200 shadow-xs"
                              : "border-stone-300 hover:scale-105"
                          }`}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Curated Royal Wedding Palettes */}
                <div className="space-y-2 pt-1 border-t border-stone-200">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Celebration Palettes
                  </span>
                  {ROYAL_PALETTES.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1">
                      <span className="text-[10px] text-stone-600 font-medium">{group.name}</span>
                      <div className="flex items-center gap-1.5">
                        {group.colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            disabled={selectedElement.isLocked}
                            onClick={() => updateSelected("color", color)}
                            style={{ backgroundColor: color }}
                            className={`h-6 w-6 rounded-md border transition-transform cursor-pointer ${
                              selectedElement.color.toLowerCase() === color.toLowerCase()
                                ? "border-purple-600 scale-115 shadow-xs ring-1 ring-purple-400"
                                : "border-stone-300 hover:scale-105"
                            }`}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. TYPOGRAPHY DETAILS */}
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-purple-600" />
                  <span>Typography & Font</span>
                </label>

                {/* Font Family Dropdown */}
                <div>
                  <select
                    disabled={selectedElement.isLocked}
                    value={selectedElement.fontFamily}
                    onChange={(e) => updateSelected("fontFamily", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-900 focus:border-purple-500 focus:outline-none"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.name} value={font.name}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size with - / + buttons and slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-semibold text-stone-700">Font Size</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={selectedElement.isLocked}
                        onClick={() => updateSelected("fontSize", Math.max(8, selectedElement.fontSize - 1))}
                        className="h-5 w-5 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-purple-700 font-bold px-1.5 text-xs">
                        {selectedElement.fontSize}px
                      </span>
                      <button
                        type="button"
                        disabled={selectedElement.isLocked}
                        onClick={() => updateSelected("fontSize", Math.min(72, selectedElement.fontSize + 1))}
                        className="h-5 w-5 rounded bg-white border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={64}
                    disabled={selectedElement.isLocked}
                    value={selectedElement.fontSize}
                    onChange={(e) => updateSelected("fontSize", Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Style Toggles: Bold, Italic, Underline, Uppercase */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    disabled={selectedElement.isLocked}
                    onClick={() => updateSelected("isBold", !selectedElement.isBold)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      selectedElement.isBold
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={selectedElement.isLocked}
                    onClick={() => updateSelected("isItalic", !selectedElement.isItalic)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      selectedElement.isItalic
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={selectedElement.isLocked}
                    onClick={() => updateSelected("isUnderline", !selectedElement.isUnderline)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      selectedElement.isUnderline
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <Underline className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={selectedElement.isLocked}
                    onClick={() => updateSelected("isUppercase", !selectedElement.isUppercase)}
                    className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs font-bold transition-colors ${
                      selectedElement.isUppercase
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    TT
                  </button>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-1.5">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      disabled={selectedElement.isLocked}
                      onClick={() => updateSelected("align", align)}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                        selectedElement.align === align
                          ? "bg-purple-50 text-purple-700 border-purple-300 font-bold"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {align === "left" && <AlignLeft className="h-3.5 w-3.5 mr-1" />}
                      {align === "center" && <AlignCenter className="h-3.5 w-3.5 mr-1" />}
                      {align === "right" && <AlignRight className="h-3.5 w-3.5 mr-1" />}
                      <span>{align}</span>
                    </button>
                  ))}
                </div>

                {/* Letter Spacing & Line Height */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1">
                      <span>Letter Spacing</span>
                      <span className="font-mono">{selectedElement.letterSpacing ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={12}
                      step={0.5}
                      disabled={selectedElement.isLocked}
                      value={selectedElement.letterSpacing ?? 0}
                      onChange={(e) => updateSelected("letterSpacing", Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1">
                      <span>Line Height</span>
                      <span className="font-mono">{selectedElement.lineHeight ?? 1.4}</span>
                    </div>
                    <input
                      type="range"
                      min={0.9}
                      max={2.4}
                      step={0.1}
                      disabled={selectedElement.isLocked}
                      value={selectedElement.lineHeight ?? 1.4}
                      onChange={(e) => updateSelected("lineHeight", Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 4. EFFECTS & APPEARANCE (GLOW, SHADOW, OPACITY, ROTATION) */}
              <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                  <span>Effects & Glow</span>
                </label>

                {/* Shadow / Glow Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Glow & Shadow Effect
                  </label>
                  <select
                    disabled={selectedElement.isLocked}
                    value={selectedElement.shadowEffect || "none"}
                    onChange={(e) => updateSelected("shadowEffect", e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-900 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="none">None (Clean Flat)</option>
                    <option value="glow">✨ Warm Golden Aura</option>
                    <option value="gold">👑 Imperial Gold Radiance</option>
                    <option value="shadow">🌑 Soft Ambient Drop Shadow</option>
                    <option value="lift">💫 3D Lift Elevation</option>
                  </select>
                </div>

                {/* Opacity slider */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1">
                    <span>Element Opacity</span>
                    <span className="font-mono">{selectedElement.opacity ?? 100}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    disabled={selectedElement.isLocked}
                    value={selectedElement.opacity ?? 100}
                    onChange={(e) => updateSelected("opacity", Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Rotation angle with quick reset */}
                <div>
                  <div className="flex justify-between text-[11px] font-medium text-stone-600 mb-1 items-center">
                    <span>Rotation Angle</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-purple-700 font-bold">{selectedElement.rotation ?? 0}°</span>
                      {(selectedElement.rotation ?? 0) !== 0 && (
                        <button
                          type="button"
                          onClick={() => updateSelected("rotation", 0)}
                          className="text-[10px] text-stone-400 hover:text-stone-700 p-0.5"
                          title="Reset to 0°"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-45}
                    max={45}
                    disabled={selectedElement.isLocked}
                    value={selectedElement.rotation ?? 0}
                    onChange={(e) => updateSelected("rotation", Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* 5. ANIMATION SELECTION */}
              <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-purple-600" />
                  <span>Card Opening Animation</span>
                </label>
                <select
                  disabled={selectedElement.isLocked}
                  value={selectedElement.animation}
                  onChange={(e) => updateSelected("animation", e.target.value)}
                  className="w-full rounded-xl border border-purple-200 bg-white p-2 text-xs text-purple-900 font-bold focus:border-purple-500 focus:outline-none"
                >
                  <option value="none">None (Static)</option>
                  <option value="shimmer">✨ Golden Shimmer Light</option>
                  <option value="pulse">💓 Heartbeat Rhythm Pulse</option>
                  <option value="float">🍃 Floating Sway</option>
                  <option value="bounce">🎈 Gentle Spring Bounce</option>
                </select>
              </div>

              {/* 6. LAYERING & POSITIONING */}
              <div className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-purple-600" />
                  <span>Layer Order</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => moveLayer(selectedElement.id, "up")}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <MoveUp className="h-3.5 w-3.5" />
                    <span>Bring Forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLayer(selectedElement.id, "down")}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <MoveDown className="h-3.5 w-3.5" />
                    <span>Send Backward</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 px-4 space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <Sliders className="h-5 w-5" />
              </div>
              <h5 className="text-xs font-bold text-stone-800">No Element Selected</h5>
              <p className="text-xs text-stone-500">
                Click any element on the card canvas to inspect its typography, color palette, animations, and layering.
              </p>
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="border-t border-stone-200 pt-4">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
              Card Quick Actions
            </h5>
            <div className="space-y-1.5">
              <button
                onClick={() => addElement("message", "Enter new wedding line...")}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Custom Text Element</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ================= 5. LIVE ANIMATED PREVIEW MODAL (CLEAN WHITE) ================= */}
      <AnimatePresence>
        {isLivePreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-center text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="font-serif font-bold text-sm text-stone-900">Live Guest Simulation</span>
                </div>
                <button
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>

              <div className="my-6 py-6 rounded-2xl border border-amber-300 bg-gradient-to-b from-[#FFFDF9] via-[#FAF3EA] to-[#F5ECE0] text-stone-900 shadow-md relative overflow-hidden">
                <div className="mx-auto flex flex-col items-center">
                  <span className="text-3xl animate-float-slow">🌹</span>
                  <h3 className="mt-2 font-serif text-2xl font-bold text-amber-950">
                    श्री गणेशाय नमः
                  </h3>
                  <p className="mt-2 text-xs text-stone-600 italic max-w-xs">
                    We cordially invite you to grace the auspicious occasion of the marriage of...
                  </p>
                  <h2 className="mt-3 font-serif text-3xl font-bold text-stone-900 animate-pulse">
                    Aarav & Priya
                  </h2>
                  <div className="mt-6">
                    <button
                      onClick={() => alert("🎉 Card Unfolded! Ceremony details & RSVP are now revealed to guests.")}
                      className="rounded-full border-2 border-amber-500 bg-white px-7 py-2 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-50 cursor-pointer"
                    >
                      Tap to open
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-500">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Audio & Particle Animations Running</span>
                </span>
                <button
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Done Testing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

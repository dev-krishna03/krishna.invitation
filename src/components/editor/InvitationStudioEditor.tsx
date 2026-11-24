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
  Undo2,
  Redo2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Upload,
  QrCode,
  Wrench,
  Wand2,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Scroll,
  Frame,
  Crop,
  Camera,
  Video as VideoIcon,
  FileCode,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { VersionHistoryDrawer } from "@/components/common/VersionHistoryDrawer";

export type ImageFrameShape =
  | "arch"
  | "circle"
  | "heart"
  | "polaroid"
  | "jharokha"
  | "oval"
  | "stamp"
  | "diamond"
  | "squircle"
  | "hexagon"
  | "double-arch"
  | "wavy";

export type StudioElement = {
  id: string;
  type: "heading" | "names" | "ganesha" | "divider" | "message" | "button" | "details" | "motif" | "image" | "qrcode" | "badge" | "video";
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  fileFormat?: string;
  qrValue?: string;
  // Frame Properties (Canva-style)
  frameShape?: ImageFrameShape;
  frameWidth?: number;
  frameHeight?: number;
  frameBorderWidth?: number;
  frameBorderColor?: string;
  frameBorderStyle?: "solid" | "double" | "dashed" | "gold-foil";
  frameShadow?: "none" | "soft" | "deep" | "gold-glow" | "lift";
  imageZoom?: number;
  imageFilter?: "none" | "warm" | "bw" | "vintage" | "golden";
  imageObjectPosition?: "center" | "top" | "bottom";
  frameCaption?: string;
  x: number;
  y: number;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isUppercase?: boolean;
  opacity: number;
  rotation: number;
  effect: "none" | "glow" | "gold" | "shadow" | "lift";
  animation: "none" | "shimmer" | "pulse" | "float" | "bounce";
  isLocked?: boolean;
  zIndex: number;
};

export type InvitationPage = {
  id: string;
  title: string;
  elements: StudioElement[];
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
  { name: "Cormorant Garamond", label: "Cormorant (Heritage)" },
  { name: "Georgia", label: "Georgia (Timeless)" },
];

const WEDDING_COLOR_PALETTES = [
  {
    id: "balcony-dusk-violet",
    name: "Balcony Dusk Violet",
    tag: "Signature Balcony",
    colors: ["#6520EE", "#8A4DFF", "#BFA3FF", "#F5F1FE", "#12042F", "#E5D9FC"],
  },
  {
    id: "royal-velvet-gold",
    name: "Royal Velvet & Gold",
    tag: "Luxury",
    colors: ["#881337", "#D97706", "#991B1B", "#FEF3C7", "#78350F", "#450A0A"],
  },
  {
    id: "sacred-haldi-marigold",
    name: "Sacred Haldi & Marigold",
    tag: "Festive",
    colors: ["#B45309", "#F59E0B", "#FCD34D", "#78350F", "#FEF3C7", "#92400E"],
  },
  {
    id: "palace-emerald",
    name: "Palace Emerald & Mint",
    tag: "Royal",
    colors: ["#065F46", "#047857", "#10B981", "#D1FAE5", "#022C22", "#F59E0B"],
  },
  {
    id: "romantic-rose",
    name: "Blush Rose & Wine",
    tag: "Romantic",
    colors: ["#9F1239", "#E11D48", "#FB7185", "#FFE4E6", "#4C0519", "#FDA4AF"],
  },
  {
    id: "midnight-sapphire",
    name: "Midnight Sapphire & Ivory",
    tag: "Imperial",
    colors: ["#1E3A8A", "#2563EB", "#60A5FA", "#DBEAFE", "#0F172A", "#F8FAFC"],
  },
  {
    id: "monochrome-silk",
    name: "Monochrome & Silk Ivory",
    tag: "Minimal",
    colors: ["#1C1917", "#44403C", "#78716C", "#E7E5E4", "#FAF5EB", "#FFFFFF"],
  },
];

const ROYAL_PALETTES = WEDDING_COLOR_PALETTES;

const SAMPLE_UPLOADED_PHOTOS = [
  {
    id: "photo-1",
    name: "Royal Couple Portrait",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photo-2",
    name: "Pre-Wedding Mehndi",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photo-3",
    name: "Gold Ring Ceremony",
    url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photo-4",
    name: "Varmala Garland",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photo-5",
    name: "Sangeet Dance",
    url: "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "photo-6",
    name: "Mandap Pheras",
    url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80",
  },
];

export type FrameShapeDefinition = {
  id: ImageFrameShape;
  name: string;
  category: "royal" | "classic" | "vintage" | "modern";
  defaultWidth: number;
  defaultHeight: number;
  description: string;
  badge?: string;
};

export const FRAME_SHAPES: FrameShapeDefinition[] = [
  { id: "arch", name: "Royal Arch", category: "royal", defaultWidth: 170, defaultHeight: 220, description: "Classic wedding archway with curved dome", badge: "Popular" },
  { id: "circle", name: "Circle Mask", category: "classic", defaultWidth: 170, defaultHeight: 170, description: "Minimalist circular portrait cutout" },
  { id: "heart", name: "Romantic Heart", category: "vintage", defaultWidth: 180, defaultHeight: 170, description: "Romantic heart-shaped couple frame" },
  { id: "polaroid", name: "Polaroid Film", category: "vintage", defaultWidth: 180, defaultHeight: 220, description: "Retro instant film card with caption", badge: "Trending" },
  { id: "jharokha", name: "Rajasthani Jharokha", category: "royal", defaultWidth: 180, defaultHeight: 230, description: "Ornate palace window with cusped arch", badge: "Indian Royal" },
  { id: "oval", name: "Cameo Oval", category: "classic", defaultWidth: 160, defaultHeight: 210, description: "Victorian royal cameo oval frame" },
  { id: "stamp", name: "Postage Stamp", category: "vintage", defaultWidth: 170, defaultHeight: 210, description: "Perforated vintage stamp cutout" },
  { id: "diamond", name: "Diamond Rhombus", category: "modern", defaultWidth: 180, defaultHeight: 180, description: "Geometric 45-degree angled diamond" },
  { id: "squircle", name: "Modern Squircle", category: "modern", defaultWidth: 170, defaultHeight: 200, description: "Soft smooth rounded squircle" },
  { id: "hexagon", name: "Polygon Hexagon", category: "modern", defaultWidth: 180, defaultHeight: 190, description: "Geometric 6-sided honeycomb polygon" },
  { id: "double-arch", name: "Twin Cathedral Arch", category: "royal", defaultWidth: 170, defaultHeight: 220, description: "Concentric twin wedding arch" },
  { id: "wavy", name: "Organic Wavy Blob", category: "modern", defaultWidth: 180, defaultHeight: 190, description: "Fluid contemporary aesthetic blob" },
];

function getImageFilterCss(filter?: string) {
  switch (filter) {
    case "warm":
      return "sepia(0.25) saturate(1.25) contrast(1.05)";
    case "bw":
      return "grayscale(1) contrast(1.15) brightness(1.02)";
    case "vintage":
      return "sepia(0.55) contrast(1.1) brightness(0.95)";
    case "golden":
      return "saturate(1.4) hue-rotate(-8deg) brightness(1.06)";
    default:
      return "none";
  }
}

function getFrameContainerStyle(shape: ImageFrameShape, el: StudioElement): React.CSSProperties {
  const width = el.frameWidth || 180;
  const height = el.frameHeight || (shape === "circle" || shape === "diamond" ? width : 220);

  let borderRadius = "0px";
  let clipPath: string | undefined = undefined;

  switch (shape) {
    case "arch":
      borderRadius = `${Math.min(width, height) / 2}px ${Math.min(width, height) / 2}px 16px 16px`;
      break;
    case "circle":
      borderRadius = "9999px";
      break;
    case "oval":
      borderRadius = "50%";
      break;
    case "squircle":
      borderRadius = "32px";
      break;
    case "double-arch":
      borderRadius = `${Math.min(width, height) / 2}px ${Math.min(width, height) / 2}px 20px 20px`;
      break;
    case "wavy":
      borderRadius = "60% 40% 30% 70% / 60% 30% 70% 40%";
      break;
    case "heart":
      clipPath = "url(#frame-heart)";
      break;
    case "stamp":
      clipPath = "url(#frame-stamp)";
      break;
    case "diamond":
      clipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
      break;
    case "hexagon":
      clipPath = "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
      break;
    case "jharokha":
      borderRadius = "50% 50% 12px 12px / 45% 45% 12px 12px";
      break;
    case "polaroid":
      borderRadius = "4px";
      break;
  }

  let boxShadow = "none";
  switch (el.frameShadow) {
    case "soft":
      boxShadow = "0 8px 24px -4px rgba(0,0,0,0.15)";
      break;
    case "deep":
      boxShadow = "0 16px 36px -6px rgba(0,0,0,0.3)";
      break;
    case "gold-glow":
      boxShadow = "0 0 20px rgba(217, 119, 6, 0.45), 0 0 6px rgba(251, 191, 36, 0.8)";
      break;
    case "lift":
      boxShadow = "0 20px 30px -10px rgba(0,0,0,0.22), 0 10px 10px -5px rgba(0,0,0,0.06)";
      break;
  }

  return {
    width: `${width}px`,
    height: shape === "circle" || shape === "diamond" ? `${width}px` : `${height}px`,
    borderRadius,
    clipPath,
    boxShadow,
  };
}

function CanvaEmptyFramePlaceholder() {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#87CEEB] via-[#B0E0E6] to-[#90EE90] overflow-hidden flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Sun */}
      <div className="absolute top-2.5 right-3.5 h-5 w-5 rounded-full bg-amber-300 shadow-md ring-2 ring-amber-100/60" />
      {/* Cloud */}
      <div className="absolute top-4 left-3 flex items-center opacity-85">
        <div className="h-3 w-6 rounded-full bg-white shadow-xs" />
        <div className="-ml-2.5 h-5 w-5 rounded-full bg-white shadow-xs" />
        <div className="-ml-1.5 h-3 w-4 rounded-full bg-white shadow-xs" />
      </div>
      {/* Rolling Green Hills */}
      <svg viewBox="0 0 200 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-2/3">
        <path d="M 0,120 L 0,60 Q 60,20 120,60 T 200,50 L 200,120 Z" fill="#66BB6A" />
        <path d="M 0,120 L 0,80 Q 90,40 160,85 T 200,75 L 200,120 Z" fill="#43A047" opacity="0.9" />
      </svg>
      {/* Center Icon Badge */}
      <div className="relative z-10 flex flex-col items-center p-2 rounded-xl bg-white/85 backdrop-blur-xs border border-white/60 shadow-xs">
        <ImageIcon className="h-4 w-4 text-stone-700" />
        <span className="mt-0.5 text-[8px] font-bold text-stone-800">Drop Photo</span>
      </div>
    </div>
  );
}

function CanvaImageFrame({
  element,
  isSelected,
  onReplaceImage,
  onOpenCrop,
  onOpenShape,
}: {
  element: StudioElement;
  isSelected: boolean;
  onReplaceImage?: () => void;
  onOpenCrop?: () => void;
  onOpenShape?: () => void;
}) {
  const shape = element.frameShape || "arch";
  const width = element.frameWidth || 180;
  const height =
    element.frameHeight || (shape === "circle" || shape === "diamond" ? width : 220);
  const borderWidth = element.frameBorderWidth ?? 2;
  const borderColor = element.frameBorderColor || "#d97706";
  const borderStyle = element.frameBorderStyle || "solid";

  if (shape === "polaroid") {
    return (
      <div className="relative group/frame flex flex-col items-center">
        {/* Floating Quick Action Pill when Selected */}
        {isSelected && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-stone-900/90 backdrop-blur-xs text-white rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg z-30 pointer-events-auto">
            <button
              type="button"
              onClick={onReplaceImage}
              className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Camera className="h-3 w-3" />
              <span>Replace</span>
            </button>
            <span className="text-stone-500">|</span>
            <button
              type="button"
              onClick={onOpenCrop}
              className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Crop className="h-3 w-3" />
              <span>Zoom</span>
            </button>
            <span className="text-stone-500">|</span>
            <button
              type="button"
              onClick={onOpenShape}
              className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <Frame className="h-3 w-3" />
              <span>Shape</span>
            </button>
          </div>
        )}

        <div
          style={{
            width: `${width}px`,
            boxShadow:
              element.frameShadow === "none"
                ? "none"
                : element.frameShadow === "gold-glow"
                ? "0 0 24px rgba(217, 119, 6, 0.4), 0 10px 25px rgba(0,0,0,0.15)"
                : "0 12px 28px -4px rgba(0,0,0,0.22), 0 0 1px rgba(0,0,0,0.15)",
          }}
          className="bg-white p-2.5 pb-6 rounded-sm border border-stone-200/90 transition-all select-none"
        >
          <div className="relative w-full aspect-square overflow-hidden bg-stone-100 rounded-2xs">
            {element.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={element.imageUrl}
                alt={element.content}
                style={{
                  transform: `scale(${(element.imageZoom || 100) / 100})`,
                  objectPosition: element.imageObjectPosition || "center",
                  filter: getImageFilterCss(element.imageFilter),
                }}
                className="w-full h-full object-cover transition-transform duration-200"
              />
            ) : (
              <CanvaEmptyFramePlaceholder />
            )}
          </div>
          <div className="mt-2 text-center font-serif text-[11px] font-semibold text-stone-700 tracking-wide truncate px-1">
            {element.frameCaption || element.content || "Aarav & Priya"}
          </div>
        </div>
      </div>
    );
  }

  // Shaped Frames
  const containerStyle = getFrameContainerStyle(shape, element);
  const isClipped = ["heart", "stamp", "diamond", "hexagon"].includes(shape);

  return (
    <div className="relative group/frame flex flex-col items-center">
      {/* Floating Quick Action Pill when Selected */}
      {isSelected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-xs text-white rounded-full px-2.5 py-1 text-[10px] font-bold shadow-lg z-30 pointer-events-auto">
          <button
            type="button"
            onClick={onReplaceImage}
            className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <Camera className="h-3 w-3" />
            <span>Replace</span>
          </button>
          <span className="text-stone-500">|</span>
          <button
            type="button"
            onClick={onOpenCrop}
            className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <Crop className="h-3 w-3" />
            <span>Zoom</span>
          </button>
          <span className="text-stone-500">|</span>
          <button
            type="button"
            onClick={onOpenShape}
            className="hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <Frame className="h-3 w-3" />
            <span>Shape</span>
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div
        style={{
          ...containerStyle,
          border:
            !isClipped && borderWidth > 0
              ? `${borderWidth}px ${borderStyle === "gold-foil" ? "solid" : borderStyle} ${borderColor}`
              : undefined,
          outline:
            shape === "double-arch" && borderWidth > 0
              ? `2px dashed ${borderColor}`
              : undefined,
          outlineOffset: shape === "double-arch" ? "-8px" : undefined,
        }}
        className={`relative overflow-hidden bg-stone-100 transition-all ${
          borderStyle === "gold-foil" && !isClipped ? "ring-2 ring-amber-300/80 ring-offset-1" : ""
        }`}
      >
        {element.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={element.imageUrl}
            alt={element.content}
            style={{
              transform: `scale(${(element.imageZoom || 100) / 100})`,
              objectPosition: element.imageObjectPosition || "center",
              filter: getImageFilterCss(element.imageFilter),
            }}
            className="w-full h-full object-cover transition-transform duration-200"
          />
        ) : (
          <CanvaEmptyFramePlaceholder />
        )}
      </div>
      {element.content && !["polaroid"].includes(shape) && (
        <span className="mt-1 text-[10px] text-stone-600 font-semibold truncate max-w-[180px]">
          {element.content}
        </span>
      )}
    </div>
  );
}

const INITIAL_PAGES: InvitationPage[] = [
  {
    id: "page-1",
    title: "Cover & Welcome",
    elements: [
      {
        id: "ganesha-1",
        type: "ganesha",
        content: "श्री गणेशाय नमः",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 22,
        fontWeight: 700,
        color: "#92400e",
        textAlign: "center",
        letterSpacing: 2,
        lineHeight: 1.3,
        opacity: 100,
        rotation: 0,
        effect: "gold",
        animation: "float",
        isLocked: false,
        zIndex: 1,
      },
      {
        id: "divider-1",
        type: "divider",
        content: "🌹",
        x: 0,
        y: 0,
        fontFamily: "sans-serif",
        fontSize: 18,
        fontWeight: 400,
        color: "#b45309",
        textAlign: "center",
        letterSpacing: 0,
        lineHeight: 1.2,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "shimmer",
        isLocked: false,
        zIndex: 2,
      },
      {
        id: "names-1",
        type: "names",
        content: "Aarav Mehta & Priya Sharma",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 28,
        fontWeight: 700,
        color: "#1c1917",
        textAlign: "center",
        letterSpacing: 1,
        lineHeight: 1.25,
        isBold: true,
        opacity: 100,
        rotation: 0,
        effect: "glow",
        animation: "pulse",
        isLocked: false,
        zIndex: 3,
      },
      {
        id: "frame-couple-1",
        type: "image",
        content: "Aarav & Priya",
        imageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80",
        frameShape: "arch",
        frameWidth: 170,
        frameHeight: 220,
        frameBorderWidth: 3,
        frameBorderColor: "#d97706",
        frameBorderStyle: "gold-foil",
        frameShadow: "gold-glow",
        imageZoom: 105,
        imageFilter: "warm",
        imageObjectPosition: "center",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 14,
        fontWeight: 600,
        color: "#92400e",
        textAlign: "center",
        letterSpacing: 1,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "shimmer",
        isLocked: false,
        zIndex: 4,
      },
      {
        id: "message-1",
        type: "message",
        content: "We cordially invite you to grace the auspicious occasion of the marriage of our beloved children...",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 14,
        fontWeight: 400,
        color: "#44403c",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.5,
        isItalic: true,
        opacity: 90,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 4,
      },
      {
        id: "button-1",
        type: "button",
        content: "Scroll down for ceremonies ↓",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 600,
        color: "#78350f",
        textAlign: "center",
        letterSpacing: 1.5,
        lineHeight: 1.2,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "pulse",
        isLocked: false,
        zIndex: 5,
      },
    ],
  },
  {
    id: "page-2",
    title: "Ceremony Timeline",
    elements: [
      {
        id: "timeline-heading-1",
        type: "heading",
        content: "॥ शुभ विवाह कार्यक्रम ॥",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 22,
        fontWeight: 700,
        color: "#92400e",
        textAlign: "center",
        letterSpacing: 1.5,
        lineHeight: 1.3,
        opacity: 100,
        rotation: 0,
        effect: "gold",
        animation: "shimmer",
        isLocked: false,
        zIndex: 1,
      },
      {
        id: "event-1",
        type: "details",
        content: "🟡 Haldi & Mehendi: 11 Dec • 10:00 AM • Mango Orchard",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 500,
        color: "#78350f",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 2,
      },
      {
        id: "event-2",
        type: "details",
        content: "✨ Royal Sangeet Night: 11 Dec • 7:30 PM • Palace Courtyard",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 500,
        color: "#78350f",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 3,
      },
      {
        id: "event-3",
        type: "details",
        content: "👑 Wedding Ceremony & Pheras: 12 Dec • 7:00 PM • Mandap Hall",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 14,
        fontWeight: 700,
        color: "#881337",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "pulse",
        isLocked: false,
        zIndex: 4,
      },
      {
        id: "event-4",
        type: "details",
        content: "🥂 Grand Reception & Dinner: 12 Dec • 9:00 PM",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 500,
        color: "#78350f",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 5,
      },
    ],
  },
  {
    id: "page-3",
    title: "Venue & Digital RSVP",
    elements: [
      {
        id: "venue-heading",
        type: "heading",
        content: "Venue Location & RSVP",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 20,
        fontWeight: 700,
        color: "#92400e",
        textAlign: "center",
        letterSpacing: 1,
        lineHeight: 1.3,
        opacity: 100,
        rotation: 0,
        effect: "gold",
        animation: "shimmer",
        isLocked: false,
        zIndex: 1,
      },
      {
        id: "venue-details",
        type: "details",
        content: "The Imperial Palace Grounds, Lake Pichola Road, Udaipur",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 13,
        fontWeight: 500,
        color: "#44403c",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 2,
      },
      {
        id: "qr-rsvp",
        type: "qrcode",
        content: "Scan for Instant RSVP",
        qrValue: "https://krishnaweddings.com/rsvp/aarav-priya",
        x: 0,
        y: 0,
        fontFamily: "Poppins",
        fontSize: 11,
        fontWeight: 600,
        color: "#1c1917",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.2,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 3,
      },
      {
        id: "blessings-msg",
        type: "message",
        content: "With best compliments from Sharma & Mehta Families",
        x: 0,
        y: 0,
        fontFamily: "Playfair Display",
        fontSize: 13,
        fontWeight: 600,
        color: "#881337",
        textAlign: "center",
        letterSpacing: 0.5,
        lineHeight: 1.4,
        isItalic: true,
        opacity: 100,
        rotation: 0,
        effect: "none",
        animation: "none",
        isLocked: false,
        zIndex: 4,
      },
    ],
  },
];

export function InvitationStudioEditor() {
  // Left Rail & Drawer
  const [activeTab, setActiveTab] = useState<
    "templates" | "elements" | "frames" | "text" | "uploads" | "tools" | "music" | "background" | "layers" | null
  >("frames");
  const [frameCategoryFilter, setFrameCategoryFilter] = useState<
    "all" | "royal" | "classic" | "vintage" | "modern"
  >("all");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");

  // Top Bar & Viewport
  const [title, setTitle] = useState("Aarav & Priya • Royal Wedding Card");
  const [viewMode, setViewMode] = useState<"mobile" | "desktop">("mobile");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const colorPickerInputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Present Split Button & Share Modal State
  const [presentMenuOpen, setPresentMenuOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Uploads State (Support for SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV)
  type CreatorUploadedItem = {
    id: string;
    slug?: string;
    name: string;
    file_url?: string | null;
    file_format?: string | null;
    media_type?: string | null;
    file_size?: number | null;
    category?: string | null;
    owner_user_id?: string | null;
  };
  const [creatorElements, setCreatorElements] = useState<CreatorUploadedItem[]>([]);
  const [isUploadingElement, setIsUploadingElement] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState(SAMPLE_UPLOADED_PHOTOS);
  const [uploadActiveSubTab, setUploadActiveSubTab] = useState<"all" | "images" | "videos" | "audio">("all");

  useEffect(() => {
    fetch("/api/elements")
      .then((res) => res.json())
      .then((data) => {
        if (data.elements) {
          const custom = data.elements.filter((e: any) => e.owner_user_id || e.file_url);
          if (custom.length > 0) {
            setCreatorElements(custom);
          }
        }
      })
      .catch((err) => console.error("Could not fetch elements:", err));
  }, []);

  // Tools State
  const [qrDestination, setQrDestination] = useState("https://krishnaweddings.com/rsvp/aarav-priya");

  // Active Template & Music
  const [currentTemplate, setCurrentTemplate] = useState(TEMPLATE_PRESETS[0]);
  const [selectedSong, setSelectedSong] = useState(SONG_PRESETS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [screenEffect, setScreenEffect] = useState<"petals" | "sparkles" | "none">("petals");

  // Top Contextual Ribbon Popovers
  const [activePopover, setActivePopover] = useState<
    | "font"
    | "color"
    | "spacing"
    | "effects"
    | "animate"
    | "position"
    | "transparency"
    | "frameShape"
    | "frameImage"
    | "frameBorder"
    | "frameZoom"
    | "frameFilter"
    | "frameShadow"
    | "frameSize"
    | null
  >(null);

  // Save or Share to Community Modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveActionType, setSaveActionType] = useState<"library" | "community">("library");
  const [customTemplateTitle, setCustomTemplateTitle] = useState("Aarav & Priya • Royal Wedding Card");
  const [targetClientName, setTargetClientName] = useState("Aarav & Priya");
  const [communityPrice, setCommunityPrice] = useState(499);
  const [communityCategory, setCommunityCategory] = useState<"LUXURY" | "TRADITIONAL" | "MINIMAL" | "FLORAL">("LUXURY");
  const [communityDescription, setCommunityDescription] = useState(
    "Opulent royal wedding invitation with sacred Ganesha invocation, floating rose petals, and Shehnai soundtrack."
  );
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);

  // Right Element Inspector & Palette State
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const inspectorColorPickerId = useId();
  const [selectedPaletteId, setSelectedPaletteId] = useState("balcony-dusk-violet");

  // MULTI-PAGE WEB CONTINUOUS STREAM MODEL
  const [pages, setPages] = useState<InvitationPage[]>(INITIAL_PAGES);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>("names-1");

  const activePalette =
    WEDDING_COLOR_PALETTES.find((p) => p.id === selectedPaletteId) || WEDDING_COLOR_PALETTES[0];

  // Find selected element across all pages
  let selectedElement: StudioElement | null = null;
  let selectedElementPageId: string | null = null;
  for (const p of pages) {
    const el = p.elements.find((e) => e.id === selectedElementId);
    if (el) {
      selectedElement = el;
      selectedElementPageId = p.id;
      break;
    }
  }

  // All Document Colors
  const allElements = pages.flatMap((p) => p.elements);
  const documentColors = Array.from(
    new Set([
      currentTemplate.themeColor,
      currentTemplate.borderColor,
      ...allElements.map((el) => el.color),
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

  // Match current section or entire invitation to a chosen Color Palette
  function matchWithColorPalette(
    palette: { name: string; colors: string[] },
    scope: "section" | "all" = "section"
  ) {
    const primary = palette.colors[0]; // Primary noble hue for headings
    const accent = palette.colors[1] || palette.colors[0]; // Accent for couple names
    const secondary = palette.colors[2] || primary; // Secondary for dividers / motifs
    const muted = palette.colors[4] || "#44403C"; // Readable neutral for messages / details

    setPages((prev) =>
      prev.map((p, pIdx) => {
        if (scope === "section" && pIdx !== activePageIndex) return p;
        return {
          ...p,
          elements: p.elements.map((el) => {
            if (el.isLocked) return el;
            let newColor = el.color;
            if (el.type === "names") {
              newColor = accent;
            } else if (el.type === "heading" || el.type === "ganesha") {
              newColor = primary;
            } else if (el.type === "divider" || el.type === "motif") {
              newColor = secondary;
            } else if (el.type === "details" || el.type === "message") {
              newColor = muted;
            } else {
              newColor = primary;
            }
            return { ...el, color: newColor };
          }),
        };
      })
    );
  }

  // Update selected element property
  function updateSelected(field: keyof StudioElement, val: unknown) {
    if (!selectedElementId) return;
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        elements: p.elements.map((el) => {
          if (el.id === selectedElementId) {
            if (el.isLocked && field !== "isLocked") return el;
            return { ...el, [field]: val };
          }
          return el;
        }),
      }))
    );
  }

  // Add new element to active page
  function addElement(type: StudioElement["type"], content: string, extra?: Partial<StudioElement>) {
    const newEl: StudioElement = {
      id: `${type}-${Date.now()}`,
      type,
      content,
      x: 0,
      y: 0,
      fontFamily: type === "ganesha" ? "Playfair Display" : "Poppins",
      fontSize: type === "heading" ? 24 : type === "divider" ? 20 : 15,
      fontWeight: type === "heading" ? 700 : 400,
      color: currentTemplate.themeColor,
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: 1.4,
      opacity: 100,
      rotation: 0,
      effect: "none",
      animation: "shimmer",
      isLocked: false,
      zIndex: allElements.length + 1,
      ...extra,
    };

    setPages((prev) =>
      prev.map((p, idx) => {
        if (idx === activePageIndex) {
          return { ...p, elements: [...p.elements, newEl] };
        }
        return p;
      })
    );
    setSelectedElementId(newEl.id);
  }

  // Duplicate element
  function duplicateElement(id: string) {
    if (!selectedElement) return;
    const newEl: StudioElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      content: `${selectedElement.content} (Copy)`,
      x: selectedElement.x + 15,
      y: selectedElement.y + 15,
      isLocked: false,
      zIndex: allElements.length + 1,
    };

    setPages((prev) =>
      prev.map((p) => {
        if (p.id === selectedElementPageId) {
          return { ...p, elements: [...p.elements, newEl] };
        }
        return p;
      })
    );
    setSelectedElementId(newEl.id);
  }

  // Delete element
  function deleteElement(id: string) {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        elements: p.elements.filter((el) => el.id !== id),
      }))
    );
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  }

  // Layer ordering within current page
  function moveLayer(id: string, direction: "up" | "down") {
    setPages((prev) =>
      prev.map((p) => {
        const idx = p.elements.findIndex((e) => e.id === id);
        if (idx === -1) return p;
        const newArr = [...p.elements];
        const item = newArr.splice(idx, 1)[0];
        if (direction === "up" && idx > 0) {
          newArr.splice(idx - 1, 0, item);
        } else if (direction === "down" && idx < p.elements.length - 1) {
          newArr.splice(idx + 1, 0, item);
        } else {
          newArr.splice(idx, 0, item);
        }
        return { ...p, elements: newArr };
      })
    );
  }

  // --- PAGE MANAGEMENT (ADD, REORDER, DUPLICATE, DELETE) ---
  function addNewPage(presetTitle?: string) {
    const pageNum = pages.length + 1;
    const newPage: InvitationPage = {
      id: `page-${Date.now()}`,
      title: presetTitle || `Section ${pageNum}: Celebrations`,
      elements: [
        {
          id: `heading-${Date.now()}`,
          type: "heading",
          content: presetTitle ? `॥ ${presetTitle} ॥` : `Section ${pageNum} Details`,
          x: 0,
          y: 0,
          fontFamily: "Playfair Display",
          fontSize: 22,
          fontWeight: 700,
          color: currentTemplate.themeColor,
          textAlign: "center",
          letterSpacing: 1.5,
          lineHeight: 1.3,
          opacity: 100,
          rotation: 0,
          effect: "gold",
          animation: "shimmer",
          isLocked: false,
          zIndex: 1,
        },
        {
          id: `msg-${Date.now()}`,
          type: "message",
          content: "Add ceremony highlights, photos, timings, or heartfelt blessings here...",
          x: 0,
          y: 0,
          fontFamily: "Poppins",
          fontSize: 13,
          fontWeight: 400,
          color: "#44403c",
          textAlign: "center",
          letterSpacing: 0.5,
          lineHeight: 1.4,
          opacity: 90,
          rotation: 0,
          effect: "none",
          animation: "none",
          isLocked: false,
          zIndex: 2,
        },
      ],
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  }

  function reorderPage(index: number, direction: "up" | "down") {
    if (direction === "up" && index > 0) {
      const newPages = [...pages];
      const temp = newPages[index];
      newPages[index] = newPages[index - 1];
      newPages[index - 1] = temp;
      setPages(newPages);
      setActivePageIndex(index - 1);
    } else if (direction === "down" && index < pages.length - 1) {
      const newPages = [...pages];
      const temp = newPages[index];
      newPages[index] = newPages[index + 1];
      newPages[index + 1] = temp;
      setPages(newPages);
      setActivePageIndex(index + 1);
    }
  }

  function duplicatePage(index: number) {
    const target = pages[index];
    const newPage: InvitationPage = {
      id: `page-${Date.now()}`,
      title: `${target.title} (Copy)`,
      elements: target.elements.map((el) => ({ ...el, id: `${el.type}-${Date.now()}-${Math.random().toString(36).substring(7)}` })),
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, newPage);
    setPages(newPages);
    setActivePageIndex(index + 1);
  }

  function deletePage(index: number) {
    if (pages.length <= 1) {
      alert("At least one page is required for the digital wedding invitation.");
      return;
    }
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setActivePageIndex(Math.max(0, index - 1));
  }

  // File Upload Handler (Supports SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV)
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const ext = file.name.split(".").pop()?.toUpperCase() || "";
    const validFormats = ["SVG", "PNG", "JPG", "JPEG", "GIF", "MP4", "MOV", "WEBM", "MP3", "M4A", "WAV"];
    if (!validFormats.includes(ext)) {
      setUploadFeedback({
        type: "error",
        message: `.${ext} format not supported. Please upload SVG, PNG, JPG, GIF, MP4, MOV, WebM, MP3, M4A, or WAV.`,
      });
      return;
    }

    setIsUploadingElement(true);
    setUploadFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
      formData.append("category", "creator-uploads");

      const res = await fetch("/api/elements/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload element");
      }

      const newEl = data.element;
      setCreatorElements((prev) => [newEl, ...prev]);

      // If user uploaded an image or vector (SVG, PNG, JPG, JPEG, GIF)
      if (
        newEl.media_type === "IMAGE" ||
        newEl.media_type === "VECTOR" ||
        ["SVG", "PNG", "JPG", "JPEG", "GIF"].includes(newEl.file_format)
      ) {
        const photoObj = { id: newEl.id, name: newEl.name, url: newEl.file_url || "" };
        setUploadedPhotos((prev) => [photoObj, ...prev]);

        // If a frame is currently selected, replace its image
        if (selectedElement && selectedElement.type === "image") {
          updateSelected("imageUrl", newEl.file_url);
        } else {
          // Otherwise add as new image frame element on canvas
          addElement("image", newEl.name, {
            imageUrl: newEl.file_url,
            fileFormat: newEl.file_format,
            frameShape: "arch",
            frameWidth: 200,
            frameHeight: 250,
            frameBorderWidth: 2,
            frameBorderColor: "#d97706",
          });
        }
      } else if (newEl.media_type === "VIDEO" || ["MP4", "MOV", "WEBM"].includes(newEl.file_format)) {
        // Add as playable video element to canvas
        addElement("video", newEl.name, {
          videoUrl: newEl.file_url,
          fileFormat: newEl.file_format,
        });
      } else if (newEl.media_type === "AUDIO" || ["MP3", "M4A", "WAV"].includes(newEl.file_format)) {
        // Set as active celebration soundtrack
        const newSong = { name: newEl.name, url: newEl.file_url || "" };
        setSelectedSong(newSong);
        if (audioRef.current && newEl.file_url) {
          audioRef.current.src = newEl.file_url;
          audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
        }
      }

      setUploadFeedback({
        type: "success",
        message: `Uploaded ${newEl.name} (${newEl.file_format}) successfully! Added to your creator library.`,
      });
      setTimeout(() => setUploadFeedback(null), 4500);
    } catch (err: any) {
      console.warn("Upload endpoint warning, falling back to local memory:", err);
      if (file.type.startsWith("image/") || ext === "SVG") {
        const reader = new FileReader();
        reader.onload = (event) => {
          const url = event.target?.result as string;
          const fallbackItem: CreatorUploadedItem = {
            id: `local-${Date.now()}`,
            name: file.name,
            file_url: url,
            file_format: ext,
            media_type: ext === "SVG" ? "VECTOR" : "IMAGE",
            file_size: file.size,
          };
          setCreatorElements((prev) => [fallbackItem, ...prev]);
          setUploadedPhotos((prev) => [{ id: fallbackItem.id, name: file.name, url }, ...prev]);
          addElement("image", file.name, { imageUrl: url, fileFormat: ext });
        };
        reader.readAsDataURL(file);
      }
      setUploadFeedback({
        type: "error",
        message: err.message || "Upload failed. Please try again.",
      });
    } finally {
      setIsUploadingElement(false);
      if (e.target) e.target.value = "";
    }
  }

  function getShadowCss(effect?: string) {
    switch (effect) {
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

  function handleSaveToLibrary() {
    setSaveSuccessNotification("Successfully saved template to your Agency Template Library!");
    setTimeout(() => {
      setSaveSuccessNotification(null);
      setIsSaveModalOpen(false);
    }, 1800);
  }

  function handleShareToCommunity() {
    setSaveSuccessNotification(
      `Successfully published "${customTemplateTitle}" to Community Marketplace for ₹${communityPrice} with 80% creator royalties!`
    );
    setTimeout(() => {
      setSaveSuccessNotification(null);
      setIsSaveModalOpen(false);
    }, 2000);
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white text-stone-900 font-sans selection:bg-rose-100 selection:text-violet-950">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={selectedSong.url}
        loop
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
      />

      {/* Hidden File Picker Input (Supports SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.gif,.mp4,.mov,.webm,.mp3,.m4a,.wav,image/svg+xml,image/png,image/jpeg,image/gif,video/mp4,video/quicktime,video/webm,audio/mpeg,audio/mp4,audio/wav,audio/x-m4a"
        onChange={handleFileUpload}
        className="sr-only"
      />

      {/* ================= 1. STUDIO SIGNATURE BALCONY DUSK VIOLET TOP HEADER BAR ================= */}
      <header className="flex h-14 shrink-0 items-center justify-between bg-gradient-to-r from-[#12042F] via-[#21094E] to-[#6520EE] px-4 shadow-md z-40 text-white">
        <div className="flex items-center gap-3">
          <Link
            href="/company"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25 transition-all shadow-xs"
            title="Return to Agency Studio"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/80 hover:text-white cursor-pointer px-2 py-1 rounded hover:bg-white/10 transition-colors">
              File
            </span>
            <div className="h-4 w-px bg-white/20" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-serif text-xs font-bold text-white hover:bg-white/10 focus:bg-white/20 border border-transparent rounded px-2.5 py-1 max-w-[190px] sm:max-w-xs truncate outline-none transition-colors"
            />
            <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              <Check className="h-3 w-3" />
              <span>Autosaved</span>
            </span>
            <VersionHistoryDrawer entityType="TEMPLATE" entityId="00000000-0000-0000-0000-000000000001" />
          </div>
        </div>

        {/* Center: Undo / Redo & Device Viewport */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-black/20 p-0.5 text-white/80">
            <button className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors" title="Undo (Ctrl+Z)">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 hover:text-white hover:bg-white/15 rounded transition-colors" title="Redo (Ctrl+Y)">
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="hidden sm:flex items-center rounded-xl bg-black/25 p-0.5 border border-white/10">
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "mobile"
                  ? "bg-white text-violet-950 shadow-xs font-bold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Mobile Web Card</span>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                viewMode === "desktop"
                  ? "bg-white text-violet-950 shadow-xs font-bold"
                  : "text-white/80 hover:text-white"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Desktop View</span>
            </button>
          </div>
        </div>

        {/* Right: Audio Toggle, Split [ Present | ⌄ ] and [ Share ] */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleAudio}
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-xl transition-colors ${
              isPlayingAudio
                ? "bg-violet-500 text-white animate-pulse shadow-xs"
                : "bg-white/15 text-white hover:bg-white/25"
            }`}
            title={isPlayingAudio ? "Mute Background Music" : "Play Background Music"}
          >
            {isPlayingAudio ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <div className="relative inline-flex items-stretch rounded-xl border border-white/25 bg-white/15 text-white shadow-xs backdrop-blur-sm">
            <button
              onClick={() => setIsLivePreviewOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold hover:bg-white/10 rounded-l-xl transition-colors cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Present</span>
            </button>
            <button
              onClick={() => setPresentMenuOpen(!presentMenuOpen)}
              className="flex items-center px-2 hover:bg-white/10 rounded-r-xl border-l border-white/20 transition-colors cursor-pointer"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {presentMenuOpen && (
              <div className="absolute top-10 right-0 w-64 rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl z-50 text-stone-900 space-y-1 animate-in fade-in duration-150">
                <div className="text-[10px] font-bold uppercase text-stone-400 px-3 py-1">
                  Presentation Modes
                </div>
                <button
                  onClick={() => {
                    setIsLivePreviewOpen(true);
                    setPresentMenuOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-violet-50 transition-colors"
                >
                  <div className="text-xs font-bold text-stone-900">Standard Continuous Web Scroll</div>
                  <div className="text-[10px] text-stone-500">Unfolds live with celebratory audio & petals</div>
                </button>
                <button
                  onClick={() => {
                    alert("Presenter view with RSVP counter & timeline queue activated!");
                    setPresentMenuOpen(false);
                  }}
                  className="w-full text-left rounded-xl p-2.5 hover:bg-violet-50 transition-colors"
                >
                  <div className="text-xs font-bold text-stone-900">Presenter View with Notes</div>
                  <div className="text-[10px] text-stone-500">Display RSVP count and stage cues</div>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-1.5 text-xs font-bold text-stone-900 shadow-md hover:bg-stone-50 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 text-violet-800" />
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* ================= 2. STUDIO CONTEXTUAL HORIZONTAL ACTION RIBBON (TOP TOOLBAR) ================= */}
      <div className="relative z-30 flex h-11 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 shadow-2xs text-xs">
        {selectedElement ? (
          selectedElement.type === "image" ? (
            /* CANVA IMAGE & FRAME CONTEXTUAL ACTION RIBBON */
            <div className="flex items-center gap-1 sm:gap-2">
              {/* 1. FRAME SHAPE SELECTOR */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameShape" ? null : "frameShape")}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Frame Shape"
                >
                  <Frame className="h-3.5 w-3.5 text-violet-700" />
                  <span className="capitalize">{FRAME_SHAPES.find((s) => s.id === (selectedElement?.frameShape || "arch"))?.name || "Frame Shape"}</span>
                  <span className="text-[10px] text-stone-400">▼</span>
                </button>

                {activePopover === "frameShape" && (
                  <div className="absolute top-9 left-0 w-80 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Choose Frame Shape
                      </span>
                      <span className="text-[10px] text-violet-700 font-semibold">12 Canva Masks</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                      {FRAME_SHAPES.map((shape) => (
                        <button
                          key={shape.id}
                          onClick={() => {
                            updateSelected("frameShape", shape.id);
                            if (!selectedElement?.frameWidth) {
                              updateSelected("frameWidth", shape.defaultWidth);
                              updateSelected("frameHeight", shape.defaultHeight);
                            }
                            setActivePopover(null);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            (selectedElement?.frameShape || "arch") === shape.id
                              ? "border-violet-600 bg-violet-50 text-violet-900 font-bold ring-1 ring-violet-300"
                              : "border-stone-200 hover:border-stone-400 hover:bg-stone-50 text-stone-700"
                          }`}
                        >
                          <div className="h-9 w-9 flex items-center justify-center bg-stone-100 rounded-md mb-1 border border-stone-200">
                            <span className="text-xs font-serif">✦</span>
                          </div>
                          <span className="text-[10px] truncate max-w-full">{shape.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-stone-200 mx-0.5" />

              {/* 2. REPLACE PHOTO BUTTON */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameImage" ? null : "frameImage")}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Replace Photo"
                >
                  <Camera className="h-3.5 w-3.5 text-violet-700" />
                  <span>Replace Photo</span>
                  <span className="text-[10px] text-stone-400">▼</span>
                </button>

                {activePopover === "frameImage" && (
                  <div className="absolute top-9 left-0 w-80 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-3">
                    <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                        Replace Photo in Frame
                      </span>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] font-bold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="h-3 w-3" />
                        Upload New
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-stone-700 block">Wedding Gallery Stock</span>
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => {
                              updateSelected("imageUrl", photo.url);
                              updateSelected("content", photo.name);
                              setActivePopover(null);
                            }}
                            className="relative group rounded-lg overflow-hidden border border-stone-200 aspect-square hover:ring-2 hover:ring-violet-600 transition-all cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-100">
                      <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Or Image URL</span>
                      <input
                        type="text"
                        placeholder="https://..."
                        defaultValue={selectedElement.imageUrl || ""}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateSelected("imageUrl", (e.target as HTMLInputElement).value);
                            setActivePopover(null);
                          }
                        }}
                        className="w-full rounded-lg border border-stone-200 px-2.5 py-1 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-stone-200 mx-0.5" />

              {/* 3. BORDER CONTROLS */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameBorder" ? null : "frameBorder")}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Frame Border"
                >
                  <div
                    style={{ backgroundColor: selectedElement.frameBorderColor || "#d97706" }}
                    className="h-3.5 w-3.5 rounded-full border border-stone-300"
                  />
                  <span>Border: {selectedElement.frameBorderWidth ?? 2}px</span>
                  <span className="text-[10px] text-stone-400">▼</span>
                </button>

                {activePopover === "frameBorder" && (
                  <div className="absolute top-9 left-0 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                        <span>Border Width</span>
                        <span className="font-mono">{selectedElement.frameBorderWidth ?? 2}px</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={16}
                        value={selectedElement.frameBorderWidth ?? 2}
                        onChange={(e) => updateSelected("frameBorderWidth", Number(e.target.value))}
                        className="w-full accent-violet-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">Border Style</span>
                      <div className="grid grid-cols-4 gap-1 text-[10px] font-semibold">
                        {[
                          { id: "solid", label: "Solid" },
                          { id: "double", label: "Double" },
                          { id: "dashed", label: "Dashed" },
                          { id: "gold-foil", label: "Gold Foil" },
                        ].map((st) => (
                          <button
                            key={st.id}
                            onClick={() => updateSelected("frameBorderStyle", st.id)}
                            className={`py-1 rounded-md border text-center transition-all ${
                              (selectedElement.frameBorderStyle || "solid") === st.id
                                ? "bg-violet-50 border-violet-600 text-violet-800 font-bold"
                                : "border-stone-200 hover:bg-stone-50 text-stone-600"
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-stone-700 block mb-1.5">Border Color</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { hex: "#d97706", name: "Imperial Gold" },
                          { hex: "#881337", name: "Royal Rose" },
                          { hex: "#6520EE", name: "Dusk Violet" },
                          { hex: "#ffffff", name: "Ivory White" },
                          { hex: "#047857", name: "Vedic Emerald" },
                          { hex: "#1c1917", name: "Rich Charcoal" },
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => updateSelected("frameBorderColor", c.hex)}
                            style={{ backgroundColor: c.hex }}
                            className={`h-6 w-6 rounded-full border transition-transform ${
                              (selectedElement.frameBorderColor || "#d97706") === c.hex
                                ? "scale-115 ring-2 ring-violet-600 border-white shadow-xs"
                                : "border-stone-300 hover:scale-105"
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-4 w-px bg-stone-200 mx-0.5" />

              {/* 4. CROP & ZOOM */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameZoom" ? null : "frameZoom")}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Zoom & Crop"
                >
                  <Crop className="h-3.5 w-3.5 text-violet-700" />
                  <span>Zoom: {selectedElement.imageZoom || 100}%</span>
                </button>

                {activePopover === "frameZoom" && (
                  <div className="absolute top-9 left-0 w-60 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                        <span>Photo Zoom inside Frame</span>
                        <span className="font-mono">{selectedElement.imageZoom || 100}%</span>
                      </div>
                      <input
                        type="range"
                        min={100}
                        max={200}
                        step={5}
                        value={selectedElement.imageZoom || 100}
                        onChange={(e) => updateSelected("imageZoom", Number(e.target.value))}
                        className="w-full accent-violet-700 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-stone-700 block mb-1">Crop Alignment</span>
                      <div className="grid grid-cols-3 gap-1 text-[10px] font-semibold">
                        {[
                          { id: "top", label: "Top" },
                          { id: "center", label: "Center" },
                          { id: "bottom", label: "Bottom" },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => updateSelected("imageObjectPosition", pos.id)}
                            className={`py-1 rounded-md border text-center transition-all ${
                              (selectedElement.imageObjectPosition || "center") === pos.id
                                ? "bg-violet-50 border-violet-600 text-violet-800 font-bold"
                                : "border-stone-200 hover:bg-stone-50 text-stone-600"
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. PHOTO FILTERS */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameFilter" ? null : "frameFilter")}
                  className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Photo Filter"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Filter</span>
                </button>

                {activePopover === "frameFilter" && (
                  <div className="absolute top-9 left-0 w-56 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 block">
                      Color Grading Presets
                    </span>
                    {[
                      { id: "none", label: "Original Clean" },
                      { id: "warm", label: "☀️ Warm Sunlight" },
                      { id: "bw", label: "🖤 Noir Black & White" },
                      { id: "vintage", label: "📜 Royal Vintage Sepia" },
                      { id: "golden", label: "✨ Golden Hour Glow" },
                    ].map((fil) => (
                      <button
                        key={fil.id}
                        onClick={() => {
                          updateSelected("imageFilter", fil.id);
                          setActivePopover(null);
                        }}
                        className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          (selectedElement.imageFilter || "none") === fil.id
                            ? "bg-violet-50 text-violet-800 font-bold"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {fil.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. SHADOW & GLOW */}
              <div className="relative">
                <button
                  onClick={() => setActivePopover(activePopover === "frameShadow" ? null : "frameShadow")}
                  className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
                  title="Frame Shadow"
                >
                  <span>Shadow</span>
                </button>

                {activePopover === "frameShadow" && (
                  <div className="absolute top-9 left-0 w-52 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl z-50 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1 block">
                      Frame Elevation
                    </span>
                    {[
                      { id: "none", label: "None (Flat)" },
                      { id: "soft", label: "Soft Shadow" },
                      { id: "deep", label: "Deep 3D Shadow" },
                      { id: "gold-glow", label: "✨ Golden Halo" },
                      { id: "lift", label: "💫 Floating Lift" },
                    ].map((sh) => (
                      <button
                        key={sh.id}
                        onClick={() => {
                          updateSelected("frameShadow", sh.id);
                          setActivePopover(null);
                        }}
                        className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                          (selectedElement.frameShadow || "none") === sh.id
                            ? "bg-violet-50 text-violet-800 font-bold"
                            : "text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. POLAROID CAPTION INPUT (if polaroid) */}
              {(selectedElement.frameShape === "polaroid") && (
                <input
                  value={selectedElement.frameCaption || ""}
                  onChange={(e) => updateSelected("frameCaption", e.target.value)}
                  placeholder="Caption: e.g. Aarav & Priya"
                  className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-serif font-bold text-stone-800 max-w-[140px]"
                  title="Edit Polaroid Caption"
                />
              )}

              {/* 8. DETACH / RESET PHOTO */}
              {selectedElement.imageUrl && (
                <button
                  onClick={() => updateSelected("imageUrl", "")}
                  className="h-8 px-2 rounded-lg border border-stone-200 bg-stone-50 flex items-center gap-1 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs"
                  title="Detach photo from frame"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span className="hidden sm:inline">Detach</span>
                </button>
              )}

              <div className="h-4 w-px bg-stone-200 mx-0.5" />

              {/* DUPLICATE, LOCK, DELETE */}
              <button
                onClick={() => duplicateElement(selectedElement.id)}
                className="h-8 w-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center hover:bg-white text-stone-700"
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => updateSelected("isLocked", !selectedElement.isLocked)}
                className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
                  selectedElement.isLocked
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                }`}
                title={selectedElement.isLocked ? "Unlock" : "Lock"}
              >
                {selectedElement.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={() => deleteElement(selectedElement.id)}
                className="h-8 w-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center hover:bg-rose-50 hover:text-rose-700 text-stone-700"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            /* TEXT & OTHER ELEMENTS CONTEXTUAL ACTION RIBBON */
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "font" ? null : "font")}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-800 hover:bg-white hover:border-violet-300"
              >
                <span className="truncate max-w-[110px]">{selectedElement.fontFamily}</span>
                <span className="text-[10px] text-stone-400">▼</span>
              </button>

              {activePopover === "font" && (
                <div className="absolute top-9 left-0 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl z-50 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 py-1">
                    Wedding & Luxury Typography
                  </div>
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.name}
                      onClick={() => {
                        updateSelected("fontFamily", f.name);
                        setActivePopover(null);
                      }}
                      style={{ fontFamily: f.name }}
                      className={`w-full text-left rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-violet-50 transition-colors ${
                        selectedElement.fontFamily === f.name ? "bg-violet-50 text-rose-800 font-bold" : "text-stone-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-stone-200 mx-0.5" />

            <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
              <button
                onClick={() => updateSelected("fontSize", Math.max(8, selectedElement.fontSize - 1))}
                className="h-6 w-6 rounded flex items-center justify-center text-stone-600 hover:bg-white"
                title="Decrease font size"
              >
                <Minus className="h-3 w-3" />
              </button>
              <input
                type="number"
                value={selectedElement.fontSize}
                onChange={(e) => updateSelected("fontSize", Number(e.target.value))}
                className="w-8 text-center font-mono text-xs font-bold bg-transparent outline-none text-rose-800"
              />
              <button
                onClick={() => updateSelected("fontSize", Math.min(72, selectedElement.fontSize + 1))}
                className="h-6 w-6 rounded flex items-center justify-center text-stone-600 hover:bg-white"
                title="Increase font size"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "color" ? null : "color")}
                className="flex flex-col items-center justify-center h-8 w-8 rounded-lg border border-stone-200 bg-stone-50 hover:bg-white hover:border-violet-300"
                title="Text Color"
              >
                <span className="font-serif font-bold text-xs leading-none">A</span>
                <span
                  style={{ backgroundColor: selectedElement.color }}
                  className="h-1 w-4 rounded-full mt-0.5"
                />
              </button>

              {activePopover === "color" && (
                <div className="absolute top-9 left-0 w-72 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <span className="font-serif text-xs font-bold text-stone-900">Color Palette</span>
                    <span className="font-mono text-[10px] font-bold text-stone-700 uppercase">
                      {selectedElement.color}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={colorPickerInputId}
                      className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      <Pipette className="h-3 w-3 text-violet-700" />
                      <span>Custom Picker</span>
                      <input
                        id={colorPickerInputId}
                        type="color"
                        value={selectedElement.color.startsWith("#") ? selectedElement.color : "#881337"}
                        onChange={(e) => updateSelected("color", e.target.value)}
                        className="sr-only"
                      />
                    </label>

                    <div className="flex-1 flex items-center rounded-xl border border-stone-200 px-2 py-0.5 text-xs font-mono">
                      <span className="text-stone-400 mr-1">#</span>
                      <input
                        type="text"
                        maxLength={7}
                        value={selectedElement.color.replace("#", "")}
                        onChange={(e) => updateSelected("color", `#${e.target.value}`)}
                        className="w-full font-bold uppercase bg-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase text-stone-400 mb-1">
                      Document Colors
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {documentColors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => updateSelected("color", c)}
                          style={{ backgroundColor: c }}
                          className={`h-5 w-5 rounded-full border transition-transform ${
                            selectedElement.color.toLowerCase() === c.toLowerCase()
                              ? "scale-120 border-rose-600 ring-2 ring-rose-200"
                              : "border-stone-300 hover:scale-110"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-stone-200 mx-0.5" />

            <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50 p-0.5">
              <button
                onClick={() => updateSelected("isBold", !selectedElement.isBold)}
                className={`h-7 w-7 rounded flex items-center justify-center font-bold ${
                  selectedElement.isBold ? "bg-violet-700 text-white" : "text-stone-700 hover:bg-white"
                }`}
                title="Bold"
              >
                <Bold className="h-3 w-3" />
              </button>
              <button
                onClick={() => updateSelected("isItalic", !selectedElement.isItalic)}
                className={`h-7 w-7 rounded flex items-center justify-center ${
                  selectedElement.isItalic ? "bg-violet-700 text-white" : "text-stone-700 hover:bg-white"
                }`}
                title="Italic"
              >
                <Italic className="h-3 w-3" />
              </button>
              <button
                onClick={() => updateSelected("isUnderline", !selectedElement.isUnderline)}
                className={`h-7 w-7 rounded flex items-center justify-center ${
                  selectedElement.isUnderline ? "bg-violet-700 text-white" : "text-stone-700 hover:bg-white"
                }`}
                title="Underline"
              >
                <Underline className="h-3 w-3" />
              </button>
              <button
                onClick={() => updateSelected("isUppercase", !selectedElement.isUppercase)}
                className={`h-7 w-7 rounded flex items-center justify-center font-bold text-[10px] ${
                  selectedElement.isUppercase ? "bg-violet-700 text-white" : "text-stone-700 hover:bg-white"
                }`}
                title="Uppercase toggle"
              >
                aA
              </button>
            </div>

            {/* Spacing Popover */}
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "spacing" ? null : "spacing")}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-white"
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>Spacing</span>
              </button>

              {activePopover === "spacing" && (
                <div className="absolute top-9 left-0 w-60 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-3">
                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                      <span>Letter Spacing</span>
                      <span className="font-mono">{selectedElement.letterSpacing}px</span>
                    </div>
                    <input
                      type="range"
                      min={-2}
                      max={12}
                      step={0.5}
                      value={selectedElement.letterSpacing}
                      onChange={(e) => updateSelected("letterSpacing", Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-stone-700 mb-1">
                      <span>Line Height</span>
                      <span className="font-mono">{selectedElement.lineHeight}</span>
                    </div>
                    <input
                      type="range"
                      min={0.9}
                      max={2.4}
                      step={0.1}
                      value={selectedElement.lineHeight}
                      onChange={(e) => updateSelected("lineHeight", Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Effects Button */}
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "effects" ? null : "effects")}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${
                  selectedElement.effect !== "none"
                    ? "bg-violet-50 text-violet-800 border-violet-300 font-bold"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Effects</span>
              </button>

              {activePopover === "effects" && (
                <div className="absolute top-9 left-0 w-64 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-2">
                  <span className="block text-[10px] font-bold uppercase text-stone-400">
                    Text Effects
                  </span>
                  {[
                    { id: "none", label: "None (Flat Clean)" },
                    { id: "glow", label: "✨ Warm Golden Glow" },
                    { id: "gold", label: "👑 Imperial Gold Radiance" },
                    { id: "shadow", label: "🌑 Drop Shadow" },
                    { id: "lift", label: "💫 3D Lift Elevation" },
                  ].map((eff) => (
                    <button
                      key={eff.id}
                      onClick={() => {
                        updateSelected("effect", eff.id);
                        setActivePopover(null);
                      }}
                      className={`w-full text-left rounded-xl p-2 text-xs font-semibold border transition-all ${
                        selectedElement.effect === eff.id
                          ? "bg-violet-50 border-rose-400 text-violet-950"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {eff.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Animate Button */}
            <div className="relative">
              <button
                onClick={() => setActivePopover(activePopover === "animate" ? null : "animate")}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-semibold transition-colors ${
                  selectedElement.animation !== "none"
                    ? "bg-violet-50 text-violet-800 border-violet-300 font-bold"
                    : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
                }`}
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Animate</span>
              </button>

              {activePopover === "animate" && (
                <div className="absolute top-9 left-0 w-60 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-xl z-50 space-y-2">
                  <span className="block text-[10px] font-bold uppercase text-stone-400">
                    Opening Animation
                  </span>
                  {[
                    { id: "none", label: "None (Static)" },
                    { id: "shimmer", label: "✨ Golden Shimmer Light" },
                    { id: "pulse", label: "💓 Heartbeat Rhythm Pulse" },
                    { id: "float", label: "🍃 Floating Gentle Sway" },
                    { id: "bounce", label: "🎈 Festive Spring Bounce" },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => {
                        updateSelected("animation", anim.id);
                        setActivePopover(null);
                      }}
                      className={`w-full text-left rounded-xl p-2 text-xs font-semibold border transition-all ${
                        selectedElement.animation === anim.id
                          ? "bg-violet-50 border-rose-400 text-violet-950"
                          : "border-stone-200 hover:bg-stone-50 text-stone-700"
                      }`}
                    >
                      {anim.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-stone-200 mx-0.5" />

            <button
              onClick={() => duplicateElement(selectedElement.id)}
              className="h-8 w-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center hover:bg-white text-stone-700"
              title="Duplicate"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => updateSelected("isLocked", !selectedElement.isLocked)}
              className={`h-8 w-8 rounded-lg border flex items-center justify-center ${
                selectedElement.isLocked
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-white"
              }`}
              title={selectedElement.isLocked ? "Unlock" : "Lock"}
            >
              {selectedElement.isLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </button>

            <button
              onClick={() => deleteElement(selectedElement.id)}
              className="h-8 w-8 rounded-lg border border-stone-200 bg-stone-50 flex items-center justify-center hover:bg-violet-50 hover:text-violet-700 text-stone-700"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      ) : (
          /* CANVAS BACKGROUND / WEB FLOW PROPERTIES */
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span className="font-semibold text-stone-500">Continuous Web Invitation:</span>

            {/* Theme switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-stone-600">Theme:</span>
              <div className="flex items-center gap-1">
                {TEMPLATE_PRESETS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCurrentTemplate(t)}
                    className={`h-6 w-9 rounded-md bg-gradient-to-r ${t.bg} border transition-all ${
                      currentTemplate.id === t.id
                        ? "border-rose-600 scale-110 shadow-xs ring-1 ring-rose-300"
                        : "border-stone-300 hover:scale-105"
                    }`}
                    title={t.name}
                  />
                ))}
              </div>
            </div>

            <div className="h-4 w-px bg-stone-200" />

            {/* Screen FX */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-stone-600">FX:</span>
              <button
                onClick={() => setScreenEffect(screenEffect === "petals" ? "sparkles" : screenEffect === "sparkles" ? "none" : "petals")}
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2 py-1 text-xs font-semibold text-stone-700 hover:bg-white"
              >
                <span>{screenEffect === "petals" ? "🌸 Rose Petals" : screenEffect === "sparkles" ? "✨ Golden Sparkles" : "Clean Off"}</span>
              </button>
            </div>

            <div className="h-4 w-px bg-stone-200" />

            {/* Section Count Pill */}
            <div className="flex items-center gap-1 bg-violet-50 text-rose-800 px-2.5 py-0.5 rounded-full border border-violet-200 font-semibold text-[11px]">
              <Scroll className="h-3 w-3" />
              <span>{pages.length} Continuous Web Sections</span>
            </div>
          </div>
        )}
      </div>

      {/* ================= 3. MAIN WORKSPACE: LEFT RAIL & DRAWER + CANVAS ================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3A. SLIM STUDIO ICON RAIL (70px) */}
        <aside className="w-18 shrink-0 border-r border-stone-200 bg-white flex flex-col items-center py-3 gap-1.5 z-20 shadow-xs">
          {[
            { id: "templates", label: "Design", icon: Palette },
            { id: "frames", label: "Frames", icon: Frame },
            { id: "elements", label: "Elements", icon: Sparkles },
            { id: "text", label: "Text", icon: Type },
            { id: "uploads", label: "Uploads", icon: Upload },
            { id: "tools", label: "Tools", icon: Wrench },
            { id: "music", label: "Audio", icon: Music },
            { id: "background", label: "Background", icon: ImageIcon },
            { id: "layers", label: "Layers", icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && isDrawerOpen;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (activeTab === tab.id && isDrawerOpen) {
                    setIsDrawerOpen(false);
                  } else {
                    setActiveTab(tab.id as typeof activeTab);
                    setIsDrawerOpen(true);
                  }
                }}
                className={`group flex flex-col items-center justify-center w-14 h-13 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? "bg-violet-50 text-violet-800 font-bold border border-violet-200 shadow-xs"
                    : "text-stone-500 hover:bg-stone-50 hover:text-stone-900 font-medium"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? "text-violet-800" : "text-stone-500"}`} />
                <span className="mt-1 text-[9px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* 3B. STUDIO EXPANDABLE FLYOUT DRAWER (340px) */}
        <AnimatePresence initial={false}>
          {isDrawerOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 border-r border-stone-200 bg-white flex flex-col overflow-hidden z-10 shadow-xs"
            >
              {/* Drawer Header & Search */}
              <div className="p-3.5 border-b border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-stone-900 capitalize flex items-center gap-1.5">
                    {activeTab === "uploads" && <Upload className="h-4 w-4 text-violet-700" />}
                    {activeTab === "tools" && <Wrench className="h-4 w-4 text-violet-700" />}
                    {activeTab === "templates" && <Palette className="h-4 w-4 text-violet-700" />}
                    {activeTab === "frames" && <Frame className="h-4 w-4 text-violet-700" />}
                    {activeTab === "elements" && <Sparkles className="h-4 w-4 text-violet-700" />}
                    {activeTab === "text" && <Type className="h-4 w-4 text-violet-700" />}
                    {activeTab === "music" && <Music className="h-4 w-4 text-violet-700" />}
                    {activeTab === "background" && <ImageIcon className="h-4 w-4 text-violet-700" />}
                    {activeTab === "layers" && <Layers className="h-4 w-4 text-violet-700" />}
                    <span>{activeTab === "background" ? "Background & Theme" : activeTab === "frames" ? "Photo Frames & Masks" : activeTab}</span>
                  </h3>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs">
                  <Search className="h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={assetSearchQuery}
                    onChange={(e) => setAssetSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab}...`}
                    className="w-full bg-transparent focus:outline-none text-stone-800 placeholder:text-stone-400 text-xs"
                  />
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
                {/* 1. UPLOADS (Supports SVG, PNG, JPG/JPEG, GIF, MP4, MOV, WebM, MP3, M4A, WAV) */}
                {activeTab === "uploads" && (
                  <div className="space-y-4">
                    {/* Upload CTA Button */}
                    <div className="space-y-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingElement}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6520EE] via-[#7C3AED] to-[#DB2777] py-3 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-75"
                      >
                        {isUploadingElement ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Uploading Element...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-white" />
                            <span>Upload Media Element</span>
                          </>
                        )}
                      </button>

                      {/* Supported Formats Pills */}
                      <div className="flex flex-wrap items-center justify-center gap-1 text-[9px] text-stone-500 font-medium">
                        <span className="text-stone-400">Supported:</span>
                        {["SVG", "PNG", "JPG", "GIF", "MP4", "MOV", "WebM", "MP3", "M4A", "WAV"].map((fmt) => (
                          <span
                            key={fmt}
                            className="rounded bg-stone-100 px-1 py-0.5 text-stone-600 font-mono font-semibold"
                          >
                            .{fmt.toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Status Feedback Toast */}
                    {uploadFeedback && (
                      <div
                        className={`flex items-start gap-2 p-2.5 rounded-xl text-xs font-medium border ${
                          uploadFeedback.type === "success"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {uploadFeedback.type === "success" ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="flex-1 text-[11px] leading-tight">{uploadFeedback.message}</span>
                      </div>
                    )}

                    {/* Category Filter Sub-Tabs */}
                    <div className="grid grid-cols-4 gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200 text-[11px]">
                      <button
                        onClick={() => setUploadActiveSubTab("all")}
                        className={`py-1 rounded-lg font-semibold transition-all ${
                          uploadActiveSubTab === "all"
                            ? "bg-white text-violet-900 shadow-xs font-bold"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setUploadActiveSubTab("images")}
                        className={`py-1 rounded-lg font-semibold transition-all ${
                          uploadActiveSubTab === "images"
                            ? "bg-white text-violet-900 shadow-xs font-bold"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Images
                      </button>
                      <button
                        onClick={() => setUploadActiveSubTab("videos")}
                        className={`py-1 rounded-lg font-semibold transition-all ${
                          uploadActiveSubTab === "videos"
                            ? "bg-white text-violet-900 shadow-xs font-bold"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Videos
                      </button>
                      <button
                        onClick={() => setUploadActiveSubTab("audio")}
                        className={`py-1 rounded-lg font-semibold transition-all ${
                          uploadActiveSubTab === "audio"
                            ? "bg-white text-violet-900 shadow-xs font-bold"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Audio
                      </button>
                    </div>

                    {/* SUB-TAB 1 & 2: IMAGES & VECTORS (SVG, PNG, JPG, GIF) */}
                    {(uploadActiveSubTab === "all" || uploadActiveSubTab === "images") && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                            Images & Vectors (SVG, PNG, JPG, GIF)
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {
                              creatorElements.filter((e) =>
                                ["SVG", "PNG", "JPG", "JPEG", "GIF"].includes(e.file_format || "")
                              ).length + uploadedPhotos.length
                            }{" "}
                            items
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Creator Elements (Images/Vectors) */}
                          {creatorElements
                            .filter(
                              (e) =>
                                e.file_url &&
                                (e.media_type === "IMAGE" ||
                                  e.media_type === "VECTOR" ||
                                  ["SVG", "PNG", "JPG", "JPEG", "GIF"].includes(e.file_format || ""))
                            )
                            .map((item) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  if (selectedElement && selectedElement.type === "image") {
                                    updateSelected("imageUrl", item.file_url);
                                  } else {
                                    addElement("image", item.name, {
                                      imageUrl: item.file_url || "",
                                      fileFormat: item.file_format || "IMAGE",
                                      frameShape: "arch",
                                      frameWidth: 180,
                                      frameHeight: 230,
                                      frameBorderWidth: 2,
                                      frameBorderColor: "#d97706",
                                    });
                                  }
                                }}
                                className="group relative cursor-pointer rounded-xl border border-stone-200 bg-stone-50 overflow-hidden hover:border-violet-500 hover:shadow-xs transition-all"
                              >
                                <div className="h-24 w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px] flex items-center justify-center p-1 overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.file_url || ""}
                                    alt={item.name}
                                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>
                                <div className="p-1.5 bg-white border-t border-stone-100 flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-semibold text-stone-800 truncate block">
                                    {item.name}
                                  </span>
                                  <span className="shrink-0 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-violet-100 text-violet-700">
                                    {item.file_format || "IMG"}
                                  </span>
                                </div>
                              </div>
                            ))}

                          {/* Fallback Sample Stock Photos */}
                          {uploadedPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => {
                                if (selectedElement && selectedElement.type === "image") {
                                  updateSelected("imageUrl", photo.url);
                                } else {
                                  addElement("image", photo.name, {
                                    imageUrl: photo.url,
                                    frameShape: "arch",
                                    frameWidth: 180,
                                    frameHeight: 230,
                                    frameBorderWidth: 2,
                                    frameBorderColor: "#d97706",
                                  });
                                }
                              }}
                              className="group relative cursor-pointer rounded-xl border border-stone-200 bg-stone-50 overflow-hidden hover:border-rose-400 hover:shadow-xs transition-all"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="h-24 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="p-1.5 text-center bg-white border-t border-stone-100">
                                <span className="text-[10px] font-semibold text-stone-800 truncate block">
                                  {photo.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SUB-TAB 3: VIDEO CLIPS (MP4, MOV, WebM) */}
                    {(uploadActiveSubTab === "all" || uploadActiveSubTab === "videos") && (
                      <div className="space-y-2.5 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                            Video Highlights (MP4, MOV, WebM)
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {
                              creatorElements.filter((e) =>
                                ["MP4", "MOV", "WEBM"].includes(e.file_format || "")
                              ).length
                            }{" "}
                            videos
                          </span>
                        </div>

                        {creatorElements.filter((e) =>
                          ["MP4", "MOV", "WEBM"].includes(e.file_format || "")
                        ).length === 0 ? (
                          <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 p-4 text-center space-y-1.5">
                            <VideoIcon className="h-6 w-6 text-stone-400 mx-auto" />
                            <p className="text-xs font-semibold text-stone-700">No Videos Uploaded Yet</p>
                            <p className="text-[10px] text-stone-500">Upload MP4, MOV, or WebM clips up to 50MB</p>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-white border border-stone-200 px-2.5 py-1 text-[10px] font-bold text-violet-700 hover:bg-stone-100"
                            >
                              <Upload className="h-3 w-3" />
                              <span>Upload Video</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {creatorElements
                              .filter((e) => ["MP4", "MOV", "WEBM"].includes(e.file_format || ""))
                              .map((video) => (
                                <div
                                  key={video.id}
                                  onClick={() => {
                                    addElement("video", video.name, {
                                      videoUrl: video.file_url || "",
                                      fileFormat: video.file_format || "MP4",
                                    });
                                  }}
                                  className="group relative cursor-pointer rounded-xl border border-stone-200 bg-black overflow-hidden hover:border-violet-500 hover:shadow-md transition-all p-2 flex items-center gap-3 text-white"
                                >
                                  <div className="h-12 w-16 bg-stone-900 rounded-lg flex items-center justify-center shrink-0 border border-stone-700 relative overflow-hidden">
                                    <VideoIcon className="h-5 w-5 text-violet-400" />
                                    <span className="absolute bottom-0.5 right-0.5 text-[7px] font-bold bg-black/80 px-1 rounded text-amber-300">
                                      {video.file_format}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-xs font-semibold text-white truncate">{video.name}</h5>
                                    <span className="text-[10px] text-stone-400 block">
                                      {video.file_size
                                        ? `${(video.file_size / (1024 * 1024)).toFixed(1)} MB`
                                        : "Optimized"} • Click to Insert
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="h-7 w-7 rounded-full bg-violet-600/80 group-hover:bg-violet-600 flex items-center justify-center text-white shrink-0 shadow-xs"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* SUB-TAB 4: AUDIO TRACKS (MP3, M4A, WAV) */}
                    {(uploadActiveSubTab === "all" || uploadActiveSubTab === "audio") && (
                      <div className="space-y-2.5 pt-2 border-t border-stone-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                            Soundtracks (MP3, M4A, WAV)
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {
                              creatorElements.filter((e) =>
                                ["MP3", "M4A", "WAV"].includes(e.file_format || "")
                              ).length
                            }{" "}
                            tracks
                          </span>
                        </div>

                        {/* Creator Uploaded Audio */}
                        {creatorElements
                          .filter((e) => ["MP3", "M4A", "WAV"].includes(e.file_format || ""))
                          .map((audio) => {
                            const isCurrent = selectedSong.url === audio.file_url;
                            return (
                              <div
                                key={audio.id}
                                className={`rounded-xl border p-2.5 flex items-center justify-between gap-2 transition-all ${
                                  isCurrent
                                    ? "border-violet-600 bg-violet-50/60 shadow-2xs"
                                    : "border-stone-200 bg-stone-50 hover:border-stone-300"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <button
                                    onClick={() => {
                                      if (isCurrent && isPlayingAudio) {
                                        audioRef.current?.pause();
                                        setIsPlayingAudio(false);
                                      } else {
                                        setSelectedSong({
                                          name: audio.name,
                                          url: audio.file_url || "",
                                        });
                                        if (audioRef.current && audio.file_url) {
                                          audioRef.current.src = audio.file_url;
                                          audioRef.current
                                            .play()
                                            .then(() => setIsPlayingAudio(true))
                                            .catch(() => {});
                                        }
                                      }
                                    }}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                                      isCurrent && isPlayingAudio
                                        ? "bg-violet-700 text-white"
                                        : "bg-white text-stone-800 border border-stone-200 hover:bg-stone-100"
                                    }`}
                                  >
                                    {isCurrent && isPlayingAudio ? (
                                      <Pause className="h-3.5 w-3.5" />
                                    ) : (
                                      <Play className="h-3.5 w-3.5 ml-0.5" />
                                    )}
                                  </button>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h6 className="text-xs font-semibold text-stone-900 truncate">
                                        {audio.name}
                                      </h6>
                                      <span className="shrink-0 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                        {audio.file_format}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-stone-500">
                                      {isCurrent ? "Active Background Song" : "Click Play or Set Song"}
                                    </span>
                                  </div>
                                </div>

                                {!isCurrent && (
                                  <button
                                    onClick={() => {
                                      setSelectedSong({
                                        name: audio.name,
                                        url: audio.file_url || "",
                                      });
                                      if (audioRef.current && audio.file_url) {
                                        audioRef.current.src = audio.file_url;
                                        audioRef.current
                                          .play()
                                          .then(() => setIsPlayingAudio(true))
                                          .catch(() => {});
                                      }
                                    }}
                                    className="shrink-0 rounded-lg bg-white border border-stone-200 px-2.5 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-50"
                                  >
                                    Use Track
                                  </button>
                                )}
                              </div>
                            );
                          })}

                        {/* Upload Audio Direct Box */}
                        <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-3 text-center space-y-1">
                          <Music className="h-5 w-5 text-violet-700 mx-auto" />
                          <p className="text-xs font-semibold text-stone-800">Add Custom Audio Track</p>
                          <p className="text-[10px] text-stone-500">Supports MP3, M4A, WAV up to 25MB</p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-white border border-stone-200 px-3 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-100 cursor-pointer shadow-2xs"
                          >
                            <Upload className="h-3 w-3" />
                            <span>Browse Audio File</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TOOLS */}
                {activeTab === "tools" && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 space-y-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                        <QrCode className="h-4 w-4 text-violet-700" />
                        <span>Wedding RSVP QR Code</span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Guests can scan this QR code on the invitation to submit their RSVP directly.
                      </p>
                      <input
                        type="text"
                        value={qrDestination}
                        onChange={(e) => setQrDestination(e.target.value)}
                        placeholder="RSVP Link"
                        className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-mono text-stone-800"
                      />
                      <button
                        onClick={() =>
                          addElement("qrcode", "Scan for Digital RSVP", {
                            qrValue: qrDestination,
                            fontSize: 12,
                          })
                        }
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-violet-700 py-2 text-xs font-bold text-white hover:bg-violet-800 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add QR Code to Card</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-[11px] font-bold uppercase text-stone-400">
                        Royal Wax Seals & Monograms
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Imperial Gold Seal", icon: "🎖️", type: "badge" as const },
                          { label: "Royal Crimson Wax", icon: "🏵️", type: "badge" as const },
                          { label: "Save The Date Stamp", icon: "💍", type: "badge" as const },
                          { label: "Vedic Om Kalash", icon: "🏺", type: "badge" as const },
                        ].map((tool, idx) => (
                          <button
                            key={idx}
                            onClick={() => addElement(tool.type, tool.label)}
                            className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 p-2.5 hover:border-rose-400 hover:bg-violet-50/30 transition-all cursor-pointer"
                          >
                            <span className="text-2xl">{tool.icon}</span>
                            <span className="mt-1 text-[11px] font-semibold text-stone-800">{tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TEMPLATES */}
                {activeTab === "templates" && (
                  <div className="space-y-3">
                    <span className="block text-[11px] font-bold uppercase text-stone-400">
                      Curated Wedding Themes
                    </span>
                    {TEMPLATE_PRESETS.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        onClick={() => setCurrentTemplate(tmpl)}
                        className={`cursor-pointer rounded-2xl border p-3 transition-all ${
                          currentTemplate.id === tmpl.id
                            ? "border-rose-500 bg-violet-50/50 ring-2 ring-rose-300 shadow-xs"
                            : "border-stone-200 bg-stone-50 hover:border-violet-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-serif text-xs font-bold text-stone-900">{tmpl.name}</span>
                          <span className="text-[9px] font-semibold text-violet-800 bg-rose-100 px-2 py-0.5 rounded-full">
                            {tmpl.tag}
                          </span>
                        </div>
                        <div
                          className={`h-14 w-full rounded-xl bg-gradient-to-r ${tmpl.bg} border border-amber-300/40 shadow-inner flex items-center justify-center text-xs font-serif`}
                          style={{ color: tmpl.themeColor }}
                        >
                          श्री गणेशाय नमः
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3C. PHOTO FRAMES & MASKS (CANVA STYLE) */}
                {activeTab === "frames" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                        Photo Frames &amp; Shapes
                      </span>
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                        12 Canva Masks
                      </span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: "all", label: "All" },
                        { id: "royal", label: "Royal Arch" },
                        { id: "vintage", label: "Polaroid & Retro" },
                        { id: "classic", label: "Classic" },
                        { id: "modern", label: "Modern" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setFrameCategoryFilter(cat.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            frameCategoryFilter === cat.id
                              ? "bg-violet-700 text-white font-bold shadow-xs"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Grid of 12 Frames */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {FRAME_SHAPES.filter(
                        (f) => frameCategoryFilter === "all" || f.category === frameCategoryFilter
                      ).map((frame) => (
                        <button
                          key={frame.id}
                          onClick={() => {
                            if (selectedElement && selectedElement.type === "image") {
                              updateSelected("frameShape", frame.id);
                            } else {
                              addElement("image", frame.name, {
                                frameShape: frame.id,
                                imageUrl: SAMPLE_UPLOADED_PHOTOS[0].url,
                                frameWidth: frame.defaultWidth,
                                frameHeight: frame.defaultHeight,
                                frameBorderWidth: 2,
                                frameBorderColor: "#d97706",
                                frameBorderStyle: "solid",
                                frameShadow: "soft",
                                imageZoom: 100,
                                imageFilter: "warm",
                              });
                            }
                          }}
                          className="group relative flex flex-col items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-3 hover:border-violet-500 hover:bg-violet-50/40 hover:shadow-xs transition-all cursor-pointer text-center"
                        >
                          {/* Miniature Silhouette Preview */}
                          <div className="h-20 w-20 flex items-center justify-center relative my-1">
                            <div
                              style={{
                                ...getFrameContainerStyle(frame.id, {
                                  frameWidth: 64,
                                  frameHeight: frame.id === "circle" || frame.id === "diamond" ? 64 : 76,
                                  frameBorderWidth: 1.5,
                                  frameBorderColor: "#d97706",
                                  frameBorderStyle: "solid",
                                  frameShadow: "none",
                                } as any),
                              }}
                              className="relative overflow-hidden bg-gradient-to-b from-[#87CEEB] to-[#90EE90] border border-amber-500/70 shadow-xs"
                            >
                              {/* Canva Hills Mini Preview */}
                              <div className="absolute top-1 right-2 h-2.5 w-2.5 rounded-full bg-amber-300" />
                              <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute bottom-0 w-full h-1/2">
                                <path d="M 0,60 L 0,25 Q 30,10 60,30 T 100,20 L 100,60 Z" fill="#43A047" />
                              </svg>
                            </div>
                          </div>

                          <div className="mt-1 w-full">
                            <span className="text-[11px] font-bold text-stone-900 group-hover:text-violet-900 truncate block">
                              {frame.name}
                            </span>
                            <span className="text-[9px] text-stone-500 line-clamp-1 mt-0.5 block">
                              {frame.description}
                            </span>
                          </div>

                          {frame.badge && (
                            <span className="absolute top-2 right-2 rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-1.5 py-0.2 text-[8px] font-bold">
                              {frame.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Photo Vault Section */}
                    <div className="pt-3 border-t border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                          Photo Vault (Click to Swap)
                        </span>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-bold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="h-3 w-3" />
                          Upload
                        </button>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Select any frame on the canvas, then click a photo below to drop it into the frame:
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        {uploadedPhotos.map((photo) => (
                          <button
                            key={photo.id}
                            onClick={() => {
                              if (selectedElement && selectedElement.type === "image") {
                                updateSelected("imageUrl", photo.url);
                                updateSelected("content", photo.name);
                              } else {
                                addElement("image", photo.name, {
                                  imageUrl: photo.url,
                                  frameShape: "arch",
                                  frameWidth: 170,
                                  frameHeight: 220,
                                  frameBorderWidth: 2,
                                  frameBorderColor: "#d97706",
                                });
                              }
                            }}
                            className="group relative rounded-xl border border-stone-200 aspect-square overflow-hidden hover:border-violet-600 hover:shadow-xs transition-all cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                              Use
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. SACRED ELEMENTS & PHOTO FRAMES */}
                {activeTab === "elements" && (
                  <div className="space-y-4">
                    {/* Photo Frames Hero Spotlight */}
                    <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/50 p-3 space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
                          <Frame className="h-4 w-4 text-violet-700" />
                          <span>Photo Frames (Canva Style)</span>
                        </div>
                        <button
                          onClick={() => setActiveTab("frames")}
                          className="text-[10px] font-bold text-violet-700 hover:underline cursor-pointer"
                        >
                          View All 12 →
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: "arch", name: "Arch", icon: "🏛️" },
                          { id: "polaroid", name: "Polaroid", icon: "📷" },
                          { id: "heart", name: "Heart", icon: "❤️" },
                          { id: "jharokha", name: "Jharokha", icon: "👑" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => {
                              addElement("image", f.name, {
                                frameShape: f.id as any,
                                imageUrl: SAMPLE_UPLOADED_PHOTOS[0].url,
                                frameWidth: 170,
                                frameHeight: 210,
                                frameBorderWidth: 2,
                                frameBorderColor: "#d97706",
                              });
                            }}
                            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-stone-200 hover:border-violet-500 hover:shadow-xs transition-all cursor-pointer text-center"
                          >
                            <span className="text-lg">{f.icon}</span>
                            <span className="text-[9px] font-bold text-stone-700 mt-0.5">{f.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <span className="block text-[11px] font-bold uppercase text-stone-400">
                      Sacred Vedic Motifs
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Rose Divider", icon: "🌹", type: "divider" as const },
                        { label: "Om Symbol", icon: "ॐ", type: "ganesha" as const },
                        { label: "Shubh Vivah", icon: "॥ शुभ विवाह ॥", type: "heading" as const },
                        { label: "Diya Lamp", icon: "🪔", type: "divider" as const },
                        { label: "Mandala Motif", icon: "❂", type: "divider" as const },
                        { label: "Wedding Rings", icon: "💍", type: "divider" as const },
                        { label: "Golden Lotus", icon: "🪷", type: "divider" as const },
                        { label: "Temple Chimes", icon: "🔔", type: "divider" as const },
                      ].map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => addElement(m.type, m.icon)}
                          className="flex flex-col items-center justify-center rounded-xl border border-stone-200 bg-stone-50 p-3 hover:border-rose-400 hover:bg-violet-50/30 transition-all cursor-pointer"
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <span className="mt-1 text-[11px] font-semibold text-stone-800">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. TEXT STYLES */}
                {activeTab === "text" && (
                  <div className="space-y-3">
                    <span className="block text-[11px] font-bold uppercase text-stone-400">
                      Text Blocks
                    </span>
                    <button
                      onClick={() => addElement("heading", "शुभ विवाह निमंत्रण")}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-rose-400 hover:bg-violet-50/40 transition-all cursor-pointer"
                    >
                      <span className="font-serif text-base font-bold text-stone-900 block">
                        Add Royal Heading
                      </span>
                      <span className="text-[11px] text-stone-500">Auspicious Sanskrit / Hindi Titles</span>
                    </button>
                    <button
                      onClick={() => addElement("names", "Bride & Groom Names")}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-rose-400 hover:bg-violet-50/40 transition-all cursor-pointer"
                    >
                      <span className="font-serif text-sm font-bold text-stone-800 block">
                        Add Couple Names
                      </span>
                      <span className="text-[11px] text-stone-500">Calligraphic script styling</span>
                    </button>
                    <button
                      onClick={() => addElement("message", "We cordially invite you to celebrate the marriage of...")}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-left hover:border-rose-400 hover:bg-violet-50/40 transition-all cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-stone-800 block">
                        Add Invitation Body
                      </span>
                      <span className="text-[11px] text-stone-500">Warm cordial wording with custom line spacing</span>
                    </button>
                  </div>
                )}

                {/* 6. AUDIO TRACKS */}
                {activeTab === "music" && (
                  <div className="space-y-3">
                    <span className="block text-[11px] font-bold uppercase text-stone-400">
                      Celebration Soundtracks
                    </span>
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
                              ? "bg-violet-50 border-rose-400 text-violet-950 ring-1 ring-rose-300"
                              : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <Music className="h-3.5 w-3.5 text-violet-700 shrink-0" />
                            <span className="text-xs font-semibold truncate">{song.name}</span>
                          </div>
                          {isCur && <CheckCircle2 className="h-4 w-4 text-violet-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 7. LAYERS */}
                {activeTab === "layers" && (
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold uppercase text-stone-400">
                      Elements in {pages[activePageIndex]?.title}
                    </span>
                    {pages[activePageIndex]?.elements.map((el, i) => (
                      <div
                        key={el.id}
                        onClick={() => setSelectedElementId(el.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          selectedElementId === el.id
                            ? "bg-violet-50 border-rose-400 text-violet-950 font-bold"
                            : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="text-[10px] text-stone-400 font-mono">#{i + 1}</span>
                          <span className="truncate">{el.content}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {el.isLocked && <Lock className="h-3 w-3 text-amber-600" />}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteElement(el.id);
                            }}
                            className="p-1 text-stone-400 hover:text-violet-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 3C. CENTER CANVAS: WEB-TYPE CONTINUOUS PAGE SCROLL (NO PRINT PAGE BREAKS) */}
        <main
          onClick={() => {
            setSelectedElementId(null);
            setActivePopover(null);
          }}
          className="relative flex-1 overflow-y-auto overflow-x-hidden bg-[#EBECF0] p-6 sm:p-10 flex flex-col items-center select-none"
        >
          {/* Canvas Floating Sidebar Toggle */}
          {!isDrawerOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDrawerOpen(true);
              }}
              className="fixed top-28 left-20 z-30 flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-700 shadow-md hover:bg-stone-50"
            >
              <ChevronRight className="h-4 w-4" />
              <span>Show Assets</span>
            </button>
          )}

          {/* Dotted Grid Texture */}
          <div className="pointer-events-none fixed inset-0 opacity-[0.05] [background-image:radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Ambient Particles */}
          {screenEffect === "petals" && (
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
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
                  className="absolute text-rose-300/80 text-lg"
                >
                  🌸
                </motion.div>
              ))}
            </div>
          )}

          {/* CONTINUOUS WEB STREAM CONTAINER */}
          <div
            ref={canvasRef}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}
            className={`transition-transform duration-200 relative pb-24 ${
              viewMode === "mobile" ? "w-[410px]" : "w-[680px]"
            }`}
          >
            {/* Hanging Cord simulation on top */}
            <div className="flex justify-between px-16 -mb-2 relative z-0">
              <div className="w-0.5 h-6 bg-gradient-to-b from-stone-400 to-amber-700 shadow-xs" />
              <div className="w-0.5 h-6 bg-gradient-to-b from-stone-400 to-amber-700 shadow-xs" />
            </div>

            {/* SVG Defs for Frame Masks */}
            <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
              <defs>
                <clipPath id="frame-heart" clipPathUnits="objectBoundingBox">
                  <path d="M 0.5, 0.88 C 0.5, 0.88 0.05, 0.55 0.05, 0.32 C 0.05, 0.12 0.22, 0.05 0.36, 0.05 C 0.44, 0.05 0.48, 0.12 0.5, 0.18 C 0.52, 0.12 0.56, 0.05 0.64, 0.05 C 0.78, 0.05 0.95, 0.12 0.95, 0.32 C 0.95, 0.55 0.5, 0.88 0.5, 0.88 Z" />
                </clipPath>
                <clipPath id="frame-stamp" clipPathUnits="objectBoundingBox">
                  <path d="M 0.05,0.05 Q 0.1,0 0.15,0.05 Q 0.2,0 0.25,0.05 Q 0.3,0 0.35,0.05 Q 0.4,0 0.45,0.05 Q 0.5,0 0.55,0.05 Q 0.6,0 0.65,0.05 Q 0.7,0 0.75,0.05 Q 0.8,0 0.85,0.05 Q 0.9,0 0.95,0.05 L 0.95,0.05 Q 1,0.1 0.95,0.15 Q 1,0.2 0.95,0.25 Q 1,0.3 0.95,0.35 Q 1,0.4 0.95,0.45 Q 1,0.5 0.95,0.55 Q 1,0.6 0.95,0.65 Q 1,0.7 0.95,0.75 Q 1,0.8 0.95,0.85 Q 1,0.9 0.95,0.95 L 0.95,0.95 Q 0.9,1 0.85,0.95 Q 0.8,1 0.75,0.95 Q 0.7,1 0.65,0.95 Q 0.6,1 0.55,0.95 Q 0.5,1 0.45,0.95 Q 0.4,1 0.35,0.95 Q 0.3,1 0.25,0.95 Q 0.2,1 0.15,0.95 Q 0.1,1 0.05,0.95 L 0.05,0.95 Q 0,0.9 0.05,0.85 Q 0,0.8 0.05,0.75 Q 0,0.7 0.05,0.65 Q 0,0.6 0.05,0.55 Q 0,0.5 0.05,0.45 Q 0,0.4 0.05,0.35 Q 0,0.3 0.05,0.25 Q 0,0.2 0.05,0.15 Q 0,0.1 0.05,0.05 Z" />
                </clipPath>
              </defs>
            </svg>

            {/* SEAMLESS CONTINUOUS SCROLL CARD STACK (WEB INVITATION STREAM) */}
            <div className="space-y-6">
              {pages.map((page, pageIdx) => {
                const isPageActive = activePageIndex === pageIdx;
                return (
                  <div
                    key={page.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePageIndex(pageIdx);
                    }}
                    className={`relative rounded-3xl border-2 transition-all ${
                      isPageActive ? "border-rose-500/80 shadow-2xl" : "border-amber-400/80 shadow-xl"
                    } bg-gradient-to-b ${currentTemplate.bg} p-6 sm:p-8 backdrop-blur-md overflow-hidden min-h-[500px] flex flex-col justify-between`}
                  >
                    {/* Section Header Controls Above Each Web Section */}
                    <div className="flex items-center justify-between border-b border-amber-300/40 pb-2 mb-4 -mt-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-700 text-[10px] font-bold text-white">
                          {pageIdx + 1}
                        </span>
                        <input
                          value={page.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPages((prev) =>
                              prev.map((p, idx) => (idx === pageIdx ? { ...p, title: val } : p))
                            );
                          }}
                          className="font-serif text-xs font-bold text-stone-900 bg-transparent hover:bg-white/40 focus:bg-white rounded px-1.5 py-0.5 outline-none"
                        />
                      </div>

                      {/* Page Action Buttons (Move Up, Move Down, Duplicate, Delete) */}
                      <div className="flex items-center gap-1 text-stone-600">
                        <button
                          onClick={() => reorderPage(pageIdx, "up")}
                          disabled={pageIdx === 0}
                          className="p-1 hover:text-stone-900 hover:bg-white/50 rounded disabled:opacity-30"
                          title="Move section up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => reorderPage(pageIdx, "down")}
                          disabled={pageIdx === pages.length - 1}
                          className="p-1 hover:text-stone-900 hover:bg-white/50 rounded disabled:opacity-30"
                          title="Move section down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => duplicatePage(pageIdx)}
                          className="p-1 hover:text-stone-900 hover:bg-white/50 rounded"
                          title="Duplicate section"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deletePage(pageIdx)}
                          className="p-1 hover:text-violet-700 hover:bg-violet-50 rounded"
                          title="Delete section"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Corner Ornaments */}
                    <div className="absolute top-10 left-3 text-amber-600/60 text-xs select-none">✦</div>
                    <div className="absolute top-10 right-3 text-amber-600/60 text-xs select-none">✦</div>

                    {/* Draggable Elements in this Page */}
                    <div className="relative w-full flex-1 flex flex-col justify-center space-y-4 my-auto">
                      {page.elements.map((el) => {
                        const isSelected = selectedElementId === el.id;

                        let animClass = "";
                        if (el.animation === "shimmer") animClass = "shimmer-text";
                        if (el.animation === "pulse") animClass = "animate-pulse";
                        if (el.animation === "float") animClass = "animate-float-slow";

                        const textStyle: React.CSSProperties = {
                          fontFamily: el.fontFamily,
                          fontSize: `${el.fontSize}px`,
                          fontWeight: el.isBold ? 700 : el.fontWeight,
                          fontStyle: el.isItalic ? "italic" : "normal",
                          textDecoration: el.isUnderline ? "underline" : "none",
                          textTransform: el.isUppercase ? "uppercase" : "none",
                          letterSpacing: `${el.letterSpacing}px`,
                          lineHeight: el.lineHeight,
                          color: el.color,
                          opacity: el.opacity / 100,
                          textAlign: el.textAlign,
                          textShadow: getShadowCss(el.effect),
                        };

                        return (
                          <motion.div
                            key={el.id}
                            drag={!el.isLocked}
                            dragConstraints={canvasRef}
                            dragElastic={0}
                            dragMomentum={false}
                            onDragEnd={(_, info) => {
                              updateSelected("x", el.x + info.offset.x);
                              updateSelected("y", el.y + info.offset.y);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePageIndex(pageIdx);
                              setSelectedElementId(el.id);
                            }}
                            className={`group relative cursor-move p-2 rounded-xl transition-all ${
                              isSelected
                                ? "ring-2 ring-rose-600 bg-violet-500/10 shadow-sm z-30"
                                : "hover:ring-1 hover:ring-amber-400/50"
                            }`}
                          >
                            {isSelected && (
                              <>
                                <div className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-600 shadow-xs z-20 pointer-events-none" />
                                <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-600 shadow-xs z-20 pointer-events-none" />
                                <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-600 shadow-xs z-20 pointer-events-none" />
                                <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full bg-white border-2 border-rose-600 shadow-xs z-20 pointer-events-none" />

                                <div className="absolute -top-6 right-0 flex items-center gap-1 rounded-md bg-violet-700 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs z-20">
                                  <span>{el.type}</span>
                                  {el.isLocked && <Lock className="h-2.5 w-2.5 ml-0.5" />}
                                </div>
                              </>
                            )}

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
                                <h4 style={textStyle} className={`mt-1 font-bold ${animClass}`}>
                                  {el.content}
                                </h4>
                              </div>
                            )}

                            {el.type === "divider" && (
                              <div className="my-1 flex items-center justify-center gap-3">
                                <span className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400 to-amber-700" />
                                <span style={textStyle} className={`${animClass}`}>{el.content}</span>
                                <span className="h-px w-12 bg-gradient-to-l from-transparent via-amber-400 to-amber-700" />
                              </div>
                            )}

                            {el.type === "heading" && (
                              <h2 style={textStyle} className={`font-serif ${animClass}`}>
                                {el.content}
                              </h2>
                            )}

                            {el.type === "message" && (
                              <p style={textStyle} className={`max-w-sm mx-auto ${animClass}`}>
                                {el.content}
                              </p>
                            )}

                            {el.type === "names" && (
                              <h3 style={textStyle} className={`font-serif tracking-tight ${animClass}`}>
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
                                  style={textStyle}
                                  className={`inline-flex items-center justify-center rounded-full border-2 border-amber-500/80 bg-white/90 px-7 py-2.5 shadow-xs hover:bg-white hover:border-amber-600 transition-all ${animClass}`}
                                >
                                  <span>{el.content}</span>
                                </button>
                              </div>
                            )}

                            {el.type === "details" && (
                              <p style={textStyle} className={`${animClass}`}>
                                {el.content}
                              </p>
                            )}

                            {el.type === "image" && (
                              <CanvaImageFrame
                                element={el}
                                isSelected={isSelected}
                                onReplaceImage={() => {
                                  setSelectedElementId(el.id);
                                  setActivePopover("frameImage");
                                }}
                                onOpenCrop={() => {
                                  setSelectedElementId(el.id);
                                  setActivePopover("frameZoom");
                                }}
                                onOpenShape={() => {
                                  setSelectedElementId(el.id);
                                  setActivePopover("frameShape");
                                }}
                              />
                            )}

                            {el.type === "qrcode" && (
                              <div className="flex flex-col items-center p-3 rounded-2xl bg-white/95 border border-amber-400 shadow-md">
                                <div className="h-20 w-20 bg-stone-900 rounded-lg flex items-center justify-center text-white">
                                  <QrCode className="h-16 w-16" />
                                </div>
                                <span className="mt-1 text-[10px] font-bold text-amber-900">{el.content}</span>
                                <span className="text-[8px] text-stone-500">Scan to RSVP</span>
                              </div>
                            )}

                            {el.type === "badge" && (
                              <div className="inline-flex items-center justify-center p-2 rounded-full border-2 border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 shadow-md font-serif text-xs font-bold">
                                <span>✦ {el.content} ✦</span>
                              </div>
                            )}

                            {el.type === "video" && (
                              <div className="relative w-full max-w-sm mx-auto aspect-video rounded-2xl overflow-hidden border-2 border-stone-800 shadow-xl bg-black flex items-center justify-center">
                                <video
                                  src={el.videoUrl || el.content}
                                  controls
                                  playsInline
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[9px] font-bold text-amber-300 uppercase tracking-wider pointer-events-none">
                                  {el.fileFormat || "VIDEO"}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Continuous Web Scroll Connector Indicator */}
                    {pageIdx < pages.length - 1 && (
                      <div className="pt-4 border-t border-amber-300/40 text-center text-[10px] text-stone-500 font-semibold tracking-wider flex items-center justify-center gap-2">
                        <span>✦</span>
                        <span>Scroll Down to Next Section</span>
                        <span>✦</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* + ADD PAGE BUTTON BETWEEN / AT BOTTOM OF WEB SECTIONS */}
              <div className="flex flex-col items-center justify-center pt-2">
                <button
                  onClick={() => addNewPage()}
                  className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-rose-400 bg-white/80 hover:bg-violet-50 px-6 py-3.5 text-xs font-bold text-violet-800 shadow-sm transition-all hover:scale-102 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>+ Add Page / Web Section</span>
                </button>

                {/* Preset Section Shortcuts */}
                <div className="flex items-center gap-2 mt-2.5 text-[11px] text-stone-500">
                  <span>Quick Add:</span>
                  <button
                    onClick={() => addNewPage("Ceremony Timeline")}
                    className="hover:text-violet-800 underline cursor-pointer"
                  >
                    + Timeline
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => addNewPage("Couple Photo Gallery")}
                    className="hover:text-violet-800 underline cursor-pointer"
                  >
                    + Photos
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => addNewPage("Venue & Google Directions")}
                    className="hover:text-violet-800 underline cursor-pointer"
                  >
                    + Venue Map
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => addNewPage("Digital RSVP & Wishes")}
                    className="hover:text-violet-800 underline cursor-pointer"
                  >
                    + RSVP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ================= 4. STUDIO BOTTOM STATUS BAR WITH PAGE NAVIGATION ================= */}
      <footer className="flex h-10 shrink-0 items-center justify-between border-t border-stone-200 bg-white px-4 text-xs text-stone-600 z-30 shadow-xs">
        {/* Left: Quick Page Navigator */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-bold text-stone-800">
            Page {activePageIndex + 1} of {pages.length}:
          </span>
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setActivePageIndex(idx)}
                className={`rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
                  activePageIndex === idx
                    ? "bg-violet-700 text-white shadow-xs font-bold"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {idx + 1}. {p.title}
              </button>
            ))}
            <button
              onClick={() => addNewPage()}
              className="rounded-lg border border-dashed border-rose-400 bg-violet-50/60 px-2 py-0.5 text-[11px] font-bold text-violet-800 hover:bg-rose-100 transition-colors cursor-pointer"
              title="Add a new page/section"
            >
              + Add Page
            </button>
          </div>
        </div>

        {/* Right: Studio Zoom Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
            className="p-1 hover:text-stone-900 cursor-pointer"
            title="Zoom out"
          >
            <Minus className="h-3 w-3" />
          </button>
          <input
            type="range"
            min={60}
            max={140}
            value={zoomLevel}
            onChange={(e) => setZoomLevel(Number(e.target.value))}
            className="w-20 accent-rose-600 cursor-pointer"
          />
          <span className="font-mono text-[11px] font-bold text-stone-700 w-8 text-center">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
            className="p-1 hover:text-stone-900 cursor-pointer"
            title="Zoom in"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </footer>

      {/* ================= 5. LIVE ANIMATED PREVIEW MODAL (CONTINUOUS VERTICAL SCROLL) ================= */}
      <AnimatePresence>
        {isLivePreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Live Guest Continuous Web Invitation
                  </span>
                </div>
                <button
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Guest View */}
              <div className="my-4 overflow-y-auto pr-1 space-y-5 rounded-2xl">
                {pages.map((p, pIdx) => (
                  <div
                    key={p.id}
                    className={`rounded-2xl border border-amber-300 bg-gradient-to-b ${currentTemplate.bg} p-6 text-center text-stone-900 shadow-md relative overflow-hidden`}
                  >
                    <div className="mx-auto flex flex-col items-center">
                      <span className="text-2xl animate-float-slow">🌹</span>
                      <h3 className="mt-1 font-serif text-xl font-bold text-amber-950">
                        {p.title}
                      </h3>
                      {p.elements.map((el) => (
                        <div key={el.id} className="mt-2">
                          {el.type === "heading" && (
                            <h2 className="font-serif text-lg font-bold text-stone-900">{el.content}</h2>
                          )}
                          {el.type === "names" && (
                            <h2 className="font-serif text-2xl font-bold text-stone-900 animate-pulse">{el.content}</h2>
                          )}
                          {el.type === "message" && (
                            <p className="text-xs text-stone-700 italic max-w-xs">{el.content}</p>
                          )}
                          {el.type === "details" && (
                            <p className="text-xs text-stone-800 font-medium">{el.content}</p>
                          )}
                          {el.type === "image" && (
                            <div className="my-2 flex justify-center">
                              <CanvaImageFrame element={el} isSelected={false} />
                            </div>
                          )}
                          {el.type === "qrcode" && (
                            <div className="p-2 bg-white rounded-xl shadow-xs inline-block my-1">
                              <QrCode className="h-12 w-12 text-stone-900 mx-auto" />
                              <span className="text-[9px] font-bold text-stone-600 block">{el.content}</span>
                            </div>
                          )}
                          {el.type === "video" && (
                            <div className="my-2 max-w-xs mx-auto rounded-xl overflow-hidden border border-stone-800 shadow-md aspect-video bg-black">
                              <video src={el.videoUrl || el.content} controls className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs text-stone-500 border-t border-stone-200 pt-3">
                <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Continuous Web Scroll & Audio Active</span>
                </span>
                <button
                  onClick={() => setIsLivePreviewOpen(false)}
                  className="rounded-xl bg-violet-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-violet-800 transition-colors cursor-pointer"
                >
                  Done Testing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 6. STUDIO SIGNATURE [ SHARE ] MODAL ================= */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-violet-700" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Share this Wedding Invitation
                  </span>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5 text-violet-700" />
                    <span>Client View-Only Link</span>
                  </span>
                  <span className="text-[10px] text-violet-800 font-semibold bg-rose-100 px-2 py-0.5 rounded-full">
                    Continuous Scroll
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/try/${currentTemplate.id}`}
                    className="w-full rounded-xl border border-stone-200 bg-white p-2 text-xs font-mono text-stone-600 truncate"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/try/${currentTemplate.id}`);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className="rounded-xl bg-violet-700 px-3 py-2 text-xs font-bold text-white hover:bg-violet-800 transition-colors shrink-0"
                  >
                    {shareCopied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    setShareModalOpen(false);
                    setIsSaveModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-violet-200 bg-violet-50/50 hover:bg-violet-50 hover:border-rose-400 transition-all text-center cursor-pointer"
                >
                  <Sparkles className="h-5 w-5 text-violet-700 mb-1" />
                  <span className="text-xs font-bold text-violet-950">Community Marketplace</span>
                  <span className="text-[10px] text-violet-800">Publish or Save to Library</span>
                </button>

                <button
                  onClick={() => alert("🎉 High-res continuous card generated and downloaded!")}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:bg-stone-100 transition-all text-center cursor-pointer"
                >
                  <Download className="h-5 w-5 text-stone-700 mb-1" />
                  <span className="text-xs font-bold text-stone-900">Download Invitation</span>
                  <span className="text-[10px] text-stone-500">PNG, PDF, or MP4 Audio</span>
                </button>
              </div>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🎉 You are cordially invited! Tap to view the digital wedding card with music & animations: ${typeof window !== "undefined" ? window.location.origin : ""}/try/${currentTemplate.id}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
              >
                <span>Send to WhatsApp</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= 7. SAVE OR SHARE TO COMMUNITY MODAL (BRANCH 1) ================= */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-violet-700" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Save or Share to Community
                  </span>
                </div>
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 grid grid-cols-2 gap-2 rounded-2xl bg-stone-100 p-1 border border-stone-200">
                <button
                  type="button"
                  onClick={() => setSaveActionType("library")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                    saveActionType === "library"
                      ? "bg-white text-violet-800 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Save to Agency Library</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSaveActionType("community")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer ${
                    saveActionType === "community"
                      ? "bg-white text-violet-800 shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Share to Community</span>
                </button>
              </div>

              {saveSuccessNotification && (
                <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>{saveSuccessNotification}</span>
                </div>
              )}

              {saveActionType === "library" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Template Title
                    </label>
                    <input
                      type="text"
                      value={customTemplateTitle}
                      onChange={(e) => setCustomTemplateTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Target Client / Couple Name
                    </label>
                    <input
                      type="text"
                      value={targetClientName}
                      onChange={(e) => setTargetClientName(e.target.value)}
                      placeholder="e.g. Aarav & Priya"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
                    <p>
                      Saves this multi-page digital invitation with {pages.length} continuous sections into your <strong>Agency Template Library</strong>.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveToLibrary}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-violet-800 transition-all cursor-pointer"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>Save to My Library</span>
                  </button>
                </div>
              )}

              {saveActionType === "community" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Marketplace Template Name
                    </label>
                    <input
                      type="text"
                      value={customTemplateTitle}
                      onChange={(e) => setCustomTemplateTitle(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Category
                      </label>
                      <select
                        value={communityCategory}
                        onChange={(e) => setCommunityCategory(e.target.value as typeof communityCategory)}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs text-stone-900 focus:border-rose-500 focus:bg-white focus:outline-none"
                      >
                        <option value="LUXURY">Luxury Royal</option>
                        <option value="TRADITIONAL">Traditional</option>
                        <option value="MINIMAL">Minimalist</option>
                        <option value="FLORAL">Floral Garden</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                        Listing Price (INR)
                      </label>
                      <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs focus-within:bg-white focus-within:border-rose-500">
                        <span className="text-stone-500 font-bold mr-1">₹</span>
                        <input
                          type="number"
                          value={communityPrice}
                          onChange={(e) => setCommunityPrice(Number(e.target.value))}
                          className="w-full bg-transparent font-bold text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Template Description
                    </label>
                    <textarea
                      rows={2}
                      value={communityDescription}
                      onChange={(e) => setCommunityDescription(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>

                  <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-3 text-xs text-violet-950 flex items-center justify-between">
                    <span>Creator Royalties:</span>
                    <span className="font-bold">You earn 80% (₹{Math.round(communityPrice * 0.8)} per sale)</span>
                  </div>

                  <button
                    onClick={handleShareToCommunity}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Publish & Share to Community</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

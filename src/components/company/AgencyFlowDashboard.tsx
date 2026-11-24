"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Sparkles,
  Layers,
  ShoppingBag,
  Share2,
  ExternalLink,
  Copy,
  Check,
  CreditCard,
  Users,
  QrCode,
  MessageSquare,
  Eye,
  Edit3,
  Lock,
  Unlock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Play,
  Download,
  Filter,
  DollarSign,
  Send,
  Building2,
  ShieldCheck,
  Smartphone,
  Music,
  ArrowUpRight,
} from "lucide-react";

export type LibraryTemplate = {
  id: string;
  name: string;
  slug: string;
  category: "LUXURY" | "TRADITIONAL" | "MINIMAL" | "FLORAL";
  thumbnailUrl?: string;
  bgGradient: string;
  songName: string;
  songUrl: string;
  source: "CREATED" | "COMMUNITY";
  creatorName?: string;
  clientName?: string;
  licensedUsers?: number;
  isConfirmedByCustomer?: boolean;
  customerAccessUrl?: string;
  customerAccessPin?: string;
  createdAt: string;
};

export type CommunityTemplate = {
  id: string;
  name: string;
  slug: string;
  creatorName: string;
  creatorStudio: string;
  category: "LUXURY" | "TRADITIONAL" | "MINIMAL" | "FLORAL";
  bgGradient: string;
  songName: string;
  price: number; // in INR (0 for free)
  rating: number;
  purchasesCount: number;
  description: string;
};

// Initial default templates in agency's library
const INITIAL_LIBRARY: LibraryTemplate[] = [
  {
    id: "lib-1",
    name: "Rose Garden Royal Unfolding",
    slug: "rose-invitation",
    category: "LUXURY",
    bgGradient: "from-[#FBF2E8] via-[#FAF3EA] to-[#F2DCC8]",
    songName: "Kudmayi • Royal Shehnai",
    songUrl: "/audio/presets/shehnai-wedding.wav",
    source: "CREATED",
    clientName: "Aarav & Priya",
    licensedUsers: 500,
    isConfirmedByCustomer: true,
    customerAccessUrl: "http://localhost:3000/try/rose-invitation",
    customerAccessPin: "KRISHNA-7821",
    createdAt: "2026-11-18",
  },
  {
    id: "lib-2",
    name: "Imperial Wine Velvet & Gold",
    slug: "royal-elegance",
    category: "LUXURY",
    bgGradient: "from-[#4A0E17] via-[#7B1123] to-[#991B1B]",
    songName: "Shubh Vivah Mangalam",
    songUrl: "/audio/presets/shubh-mangalam.wav",
    source: "CREATED",
    clientName: "Rohit & Ananya",
    licensedUsers: undefined,
    isConfirmedByCustomer: false,
    createdAt: "2026-11-19",
  },
  {
    id: "lib-3",
    name: "Auspicious Marigold & Haldi Bells",
    slug: "auspicious-marigold",
    category: "TRADITIONAL",
    bgGradient: "from-[#FEF3C7] via-[#FDE68A] to-[#FCD34D]",
    songName: "Sacred Temple Bells",
    songUrl: "/audio/presets/sacred-chimes.wav",
    source: "COMMUNITY",
    creatorName: "Studio Utsav Jaipur",
    createdAt: "2026-11-19",
  },
];

// Curated Community Marketplace Catalog (Branch 2)
const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
  {
    id: "comm-1",
    name: "Vedic Lotus & Golden Shehnai",
    slug: "royal-elegance",
    creatorName: "Divya Sharma",
    creatorStudio: "VedicCraft Studios",
    category: "TRADITIONAL",
    bgGradient: "from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]",
    songName: "Sacred Temple Chimes",
    price: 499,
    rating: 4.9,
    purchasesCount: 142,
    description: "Traditional Sanskrit mantras with floating lotus petals and temple bells animation.",
  },
  {
    id: "comm-2",
    name: "Jaipur Palace Heritage Card",
    slug: "rose-invitation",
    creatorName: "Rajeev Singhania",
    creatorStudio: "Royal Rajputana Designs",
    category: "LUXURY",
    bgGradient: "from-[#450A0A] via-[#7F1D1D] to-[#991B1B]",
    songName: "Kudmayi • Royal Shehnai",
    price: 999,
    rating: 5.0,
    purchasesCount: 89,
    description: "Opulent velvet crimson card with arched Jharokha borders and gold foil foil shimmer.",
  },
  {
    id: "comm-3",
    name: "Eucalyptus & Sage Minimalist Love",
    slug: "minimal-love",
    creatorName: "Kavya Menon",
    creatorStudio: "Modern Vows Studio",
    category: "MINIMAL",
    bgGradient: "from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0]",
    songName: "Acoustic Sitar & Flute",
    price: 0,
    rating: 4.8,
    purchasesCount: 310,
    description: "Clean modern design for cocktail and sangeet night invites with subtle flute music.",
  },
  {
    id: "comm-4",
    name: "Sunlit Haldi & Genda Phool",
    slug: "auspicious-marigold",
    creatorName: "Amit Patel",
    creatorStudio: "DesiWeddings Agency",
    category: "TRADITIONAL",
    bgGradient: "from-[#FEF08A] via-[#FDE047] to-[#EAB308]",
    songName: "Shubh Vivah Mangalam",
    price: 499,
    rating: 4.9,
    purchasesCount: 204,
    description: "Vibrant yellow festive card with floral border garland and authentic Dhol sounds.",
  },
];

// Guest Licensing Tiers (Branch 3A: "Select how much Users")
const GUEST_TIERS = [
  {
    id: "tier-100",
    name: "Silver Intimate",
    capacity: 100,
    price: 999,
    popular: false,
    features: ["Up to 100 Guests", "Digital RSVP tracking", "1 Audio Track", "Map Venue integration"],
  },
  {
    id: "tier-500",
    name: "Gold Celebration",
    capacity: 500,
    price: 2499,
    popular: true,
    features: [
      "Up to 500 Guests",
      "One-click WhatsApp RSVPs",
      "Interactive Rose Petal FX",
      "Couple Story & Photo Gallery",
      "Live Guest Arrival Counter",
    ],
  },
  {
    id: "tier-2000",
    name: "Platinum Grand Gala",
    capacity: 2000,
    price: 4999,
    popular: false,
    features: [
      "Up to 2,000 Guests",
      "Multi-Event Timeline (Haldi, Mehendi, Sangeet, Shaadi)",
      "VIP Guest Segments & Custom Notes",
      "Dietary & Meal preferences",
      "Priority Cloud Hosting",
    ],
  },
  {
    id: "tier-unlimited",
    name: "Royal Imperial",
    capacity: "Unlimited",
    price: 7999,
    popular: false,
    features: [
      "Unlimited Guests",
      "Agency White-Label (Custom Branding)",
      "Custom Domain Support",
      "Dedicated WhatsApp Concierge",
      "Lifetime Guest Book Archive",
    ],
  },
];

export function AgencyFlowDashboard() {
  const [activeTab, setActiveTab] = useState<"library" | "community" | "workflow">("library");
  const [library, setLibrary] = useState<LibraryTemplate[]>(INITIAL_LIBRARY);
  const [filterSource, setFilterSource] = useState<"ALL" | "CREATED" | "COMMUNITY">("ALL");

  // Flow Modals State
  // 1. Share Preview Modal (Branch 3B: "Share Preview to Customer" -> "Generate Link" -> "Share")
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activePreviewTemplate, setActivePreviewTemplate] = useState<LibraryTemplate | null>(null);
  const [previewCustomerName, setPreviewCustomerName] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // 2. Client Confirmation & Select Users Tier Modal (Branch 3A: "Edit" -> "Confirm" -> "Select Users")
  const [userTierModalOpen, setUserTierModalOpen] = useState(false);
  const [selectedTemplateForTier, setSelectedTemplateForTier] = useState<LibraryTemplate | null>(null);
  const [selectedTier, setSelectedTier] = useState(GUEST_TIERS[1]);

  // 3. Payment Modal (Branch 3A & Branch 2 Payment)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<{
    type: "GUEST_TIER" | "BUY_COMMUNITY";
    templateName: string;
    amount: number;
    targetId: string;
  } | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // 4. Share Access to Customer Modal (Branch 3A: After payment -> "Share Access to Customer")
  const [customerAccessModalOpen, setCustomerAccessModalOpen] = useState(false);
  const [customerAccessData, setCustomerAccessData] = useState<{
    templateName: string;
    clientName: string;
    url: string;
    pin: string;
    guestQuota: string | number;
  } | null>(null);

  // Load any newly saved templates or purchases from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agency_template_library");
      if (stored) {
        setLibrary(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  function saveLibrary(newLib: LibraryTemplate[]) {
    setLibrary(newLib);
    try {
      localStorage.setItem("agency_template_library", JSON.stringify(newLib));
    } catch {
      // ignore
    }
  }

  // --- ACTION 3B: GENERATE SHARE PREVIEW LINK ---
  function openSharePreview(template: LibraryTemplate) {
    setActivePreviewTemplate(template);
    setPreviewCustomerName(template.clientName || "Sharma Wedding");
    setPreviewModalOpen(true);
  }

  function getGeneratedPreviewUrl(): string {
    if (!activePreviewTemplate) return "";
    const slug = activePreviewTemplate.slug || "rose-invitation";
    const clientParam = encodeURIComponent(previewCustomerName || "ClientDraft");
    return `${window.location.origin}/try/${slug}?preview=1&client=${clientParam}`;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // --- ACTION 3A: SELECT HOW MUCH USERS & PAY ---
  function openSelectUsersTier(template: LibraryTemplate) {
    setSelectedTemplateForTier(template);
    setUserTierModalOpen(true);
  }

  function proceedToTierPayment() {
    if (!selectedTemplateForTier) return;
    setUserTierModalOpen(false);
    setPaymentDetails({
      type: "GUEST_TIER",
      templateName: selectedTemplateForTier.name,
      amount: selectedTier.price,
      targetId: selectedTemplateForTier.id,
    });
    setPaymentModalOpen(true);
  }

  // --- ACTION 2: BUY TEMPLATE FROM COMMUNITY ---
  function buyCommunityTemplate(comm: CommunityTemplate) {
    if (comm.price === 0) {
      // Free instant download
      handlePaymentSuccess("BUY_COMMUNITY", comm.id, comm.name, 0);
    } else {
      setPaymentDetails({
        type: "BUY_COMMUNITY",
        templateName: comm.name,
        amount: comm.price,
        targetId: comm.id,
      });
      setPaymentModalOpen(true);
    }
  }

  // --- PAYMENT CONFIRMATION LOGIC ---
  function handlePaymentSuccess(
    type: "GUEST_TIER" | "BUY_COMMUNITY",
    targetId: string,
    templateName: string,
    amount: number
  ) {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentModalOpen(false);

      if (type === "GUEST_TIER") {
        // Upgrade template in library with guest license & customer credentials
        const pin = `KRISHNA-${Math.floor(1000 + Math.random() * 9000)}`;
        const target = library.find((t) => t.id === targetId);
        const accessUrl = `${window.location.origin}/try/${target?.slug || "rose-invitation"}?access=live`;

        const updated = library.map((item) => {
          if (item.id === targetId) {
            return {
              ...item,
              licensedUsers: typeof selectedTier.capacity === "number" ? selectedTier.capacity : 99999,
              isConfirmedByCustomer: true,
              customerAccessUrl: accessUrl,
              customerAccessPin: pin,
            };
          }
          return item;
        });
        saveLibrary(updated);

        // Open "Share Access to Customer" modal (Diagram final step)
        setCustomerAccessData({
          templateName,
          clientName: target?.clientName || "Bridal Couple",
          url: accessUrl,
          pin,
          guestQuota: selectedTier.capacity,
        });
        setCustomerAccessModalOpen(true);
      } else {
        // Unlocked community template into library
        const commItem = COMMUNITY_TEMPLATES.find((c) => c.id === targetId);
        const newLibItem: LibraryTemplate = {
          id: `lib-comm-${Date.now()}`,
          name: templateName,
          slug: commItem?.slug || "rose-invitation",
          category: commItem?.category || "LUXURY",
          bgGradient: commItem?.bgGradient || "from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]",
          songName: commItem?.songName || "Sacred Temple Chimes",
          songUrl: "/audio/presets/sacred-chimes.wav",
          source: "COMMUNITY",
          creatorName: commItem?.creatorName,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        saveLibrary([newLibItem, ...library]);
        setActiveTab("library");
      }
    }, 1200);
  }

  const filteredLibrary = library.filter((t) => {
    if (filterSource === "ALL") return true;
    return t.source === filterSource;
  });

  return (
    <div className="space-y-8 font-sans text-stone-900 pb-16">
      {/* ================= TOP HEADER WITH QUICK FLOW CTAS ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-6 bg-white -mx-6 -mt-6 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-rose-600 text-white shadow-xs">
              <Building2 className="h-4 w-4" />
            </span>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
              Agency Studio Hub
            </h1>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
              Workflow Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            End-to-end management: Create templates, explore community designs, customize for clients, license guest quotas, and share live access.
          </p>
        </div>

        {/* 3 Main Flow Entrypoints (Matching User Diagram) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch 1: Create Invitation in detail */}
          <Link
            href="/company/editor"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invitation (Studio)</span>
          </Link>

          {/* Branch 2: Explore Community */}
          <button
            onClick={() => setActiveTab("community")}
            className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 hover:border-rose-300 transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-rose-600" />
            <span>Explore Community Templates</span>
          </button>
        </div>
      </div>

      {/* ================= INTERACTIVE WORKFLOW ROADMAP BANNER ================= */}
      <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/60 via-stone-50 to-rose-50/40 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-rose-200/50 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <h3 className="font-serif text-sm font-bold text-stone-900">
              Agency Workflow Architecture
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-rose-700 bg-white px-3 py-1 rounded-full border border-rose-200 shadow-xs">
            Live Interactive Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Branch 1 Card */}
          <div
            onClick={() => window.open("/company/editor", "_self")}
            className="group cursor-pointer rounded-2xl border border-stone-200 bg-white p-3.5 hover:border-rose-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                Branch 1
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-rose-600 transition-colors" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-stone-900">Create Invitation</h4>
            <p className="mt-1 text-[11px] text-stone-500">
              In-detail design in Visual Studio &rarr; Save to Library or Share to Community.
            </p>
          </div>

          {/* Branch 2 Card */}
          <div
            onClick={() => setActiveTab("community")}
            className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
              activeTab === "community"
                ? "border-rose-500 bg-rose-50/60 shadow-xs"
                : "border-stone-200 bg-white hover:border-rose-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                Branch 2
              </span>
              <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-stone-900">Explore Templates</h4>
            <p className="mt-1 text-[11px] text-stone-500">
              Browse community marketplace &rarr; Buy & Pay &rarr; Auto-adds to Library.
            </p>
          </div>

          {/* Branch 3 Card */}
          <div
            onClick={() => setActiveTab("library")}
            className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
              activeTab === "library"
                ? "border-rose-500 bg-rose-50/60 shadow-xs"
                : "border-stone-200 bg-white hover:border-rose-400"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Branch 3
              </span>
              <Layers className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <h4 className="mt-2 text-xs font-bold text-stone-900">Template Library</h4>
            <p className="mt-1 text-[11px] text-stone-500">
              Edit client card &rarr; Share Preview &rarr; Select Users & Pay &rarr; Share Access.
            </p>
          </div>
        </div>
      </div>

      {/* ================= TABS SWITCHER ================= */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "library"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Downloaded / Created Template Library ({library.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("community")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "community"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Explore Community Marketplace ({COMMUNITY_TEMPLATES.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: DOWNLOADED / CREATED TEMPLATE LIBRARY (BRANCH 3) ================= */}
      {activeTab === "library" && (
        <div className="space-y-6">
          {/* Sub-filter bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(["ALL", "CREATED", "COMMUNITY"] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setFilterSource(src)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    filterSource === src
                      ? "bg-stone-900 text-white shadow-xs"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {src === "ALL" && "All Templates"}
                  {src === "CREATED" && "Custom Created"}
                  {src === "COMMUNITY" && "Community Downloaded"}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-500">
              Showing {filteredLibrary.length} of {library.length} templates
            </span>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLibrary.map((template) => {
              const isLicensed = !!template.licensedUsers;
              return (
                <div
                  key={template.id}
                  className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Preview Banner */}
                    <div
                      className={`relative h-44 w-full rounded-2xl bg-gradient-to-b ${template.bgGradient} p-4 border border-amber-300/40 shadow-inner overflow-hidden flex flex-col justify-between text-center`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between z-10">
                        <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-stone-800 shadow-xs">
                          {template.source === "CREATED" ? "🎨 Studio Original" : "🛍️ Community Download"}
                        </span>
                        {isLicensed ? (
                          <span className="rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            <span>{template.licensedUsers} Guests Licensed</span>
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-xs">
                            Draft / Unlicensed
                          </span>
                        )}
                      </div>

                      {/* Motif & Title Preview */}
                      <div className="my-auto z-10">
                        <span className="text-2xl animate-float-slow">🌹</span>
                        <h4 className="font-serif text-sm font-bold text-stone-900 mt-1">
                          {template.clientName ? `${template.clientName} Wedding` : "श्री गणेशाय नमः"}
                        </h4>
                        <p className="text-[10px] text-stone-600 italic">
                          Tap to open unfolding simulation
                        </p>
                      </div>

                      {/* Song info in banner */}
                      <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-stone-700 bg-white/70 py-0.5 rounded-full z-10 truncate px-2">
                        <Music className="h-2.5 w-2.5 text-rose-600 shrink-0" />
                        <span className="truncate">{template.songName}</span>
                      </div>
                    </div>

                    {/* Template Metadata */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-sm font-bold text-stone-900 truncate">
                          {template.name}
                        </h3>
                        <span className="text-[10px] font-semibold text-stone-500 uppercase">
                          {template.category}
                        </span>
                      </div>
                      {template.clientName && (
                        <p className="mt-0.5 text-xs text-rose-700 font-semibold flex items-center gap-1">
                          <span>Client: {template.clientName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION PATHS FROM DIAGRAM */}
                  <div className="mt-5 space-y-2.5 border-t border-stone-100 pt-4">
                    {/* Sub-path 3A: "Edit" -> "Share Preview for Confirmation" -> "Select how much users" -> "Payment" -> "Share Access" */}
                    <div className="space-y-1.5">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-rose-800">
                        Client Booking & Production (Flow 3A)
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {/* 1. Edit in Visual Studio */}
                        <Link
                          href="/company/editor"
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-rose-600" />
                          <span>Edit Studio</span>
                        </Link>

                        {/* 2. Share Preview for Confirmation */}
                        <button
                          onClick={() => openSharePreview(template)}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-amber-600" />
                          <span>Client Preview</span>
                        </button>
                      </div>

                      {/* 3. License Guest Quota (Select how much users & Payment) */}
                      {!isLicensed ? (
                        <button
                          onClick={() => openSelectUsersTier(template)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-all cursor-pointer"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Select Guest Quota & Pay (Confirm)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setCustomerAccessData({
                              templateName: template.name,
                              clientName: template.clientName || "Bridal Couple",
                              url: template.customerAccessUrl || `http://localhost:3000/try/${template.slug}`,
                              pin: template.customerAccessPin || "KRISHNA-7821",
                              guestQuota: template.licensedUsers || 500,
                            });
                            setCustomerAccessModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Share Access to Customer</span>
                        </button>
                      )}
                    </div>

                    {/* Sub-path 3B: "Share Preview to Customer" -> "Generate Link" -> "Share" */}
                    <div className="pt-2 border-t border-stone-100">
                      <button
                        onClick={() => openSharePreview(template)}
                        className="w-full flex items-center justify-between text-xs text-stone-500 hover:text-stone-900 transition-colors p-1"
                      >
                        <span className="text-[11px] font-medium flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          <span>Quick Proposal Share (Flow 3B)</span>
                        </span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 2: EXPLORE COMMUNITY TEMPLATES (BRANCH 2) ================= */}
      {activeTab === "community" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Community Designer Marketplace
              </h3>
              <p className="mt-0.5 text-xs text-stone-500">
                Purchase commercial licenses from verified wedding creators. Instantly adds to your Agency Library with unlimited client customizations.
              </p>
            </div>
            <Link
              href="/company/editor"
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Publish Your Template to Earn</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMUNITY_TEMPLATES.map((comm) => (
              <div
                key={comm.id}
                className="rounded-3xl border border-stone-200 bg-white p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Visual card header */}
                  <div
                    className={`h-40 w-full rounded-2xl bg-gradient-to-b ${comm.bgGradient} p-4 border border-amber-300/40 shadow-inner flex flex-col justify-between text-center relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold text-stone-800 bg-white/90 px-2 py-0.5 rounded-full">
                        {comm.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {comm.price === 0 ? "Free" : `₹${comm.price}`}
                      </span>
                    </div>

                    <div className="my-auto z-10">
                      <span className="text-2xl animate-float-slow">🪷</span>
                      <h4 className="font-serif text-xs font-bold text-stone-900 mt-1">
                        {comm.name}
                      </h4>
                    </div>

                    <div className="text-[10px] text-stone-600 z-10 truncate bg-white/60 rounded px-1">
                      {comm.songName}
                    </div>
                  </div>

                  {/* Creator & Details */}
                  <div className="mt-3">
                    <h3 className="font-serif text-sm font-bold text-stone-900 truncate">
                      {comm.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <span>By {comm.creatorName}</span>
                      <span>•</span>
                      <span className="text-rose-700 font-semibold">{comm.creatorStudio}</span>
                    </p>
                    <p className="mt-2 text-xs text-stone-600 line-clamp-2">
                      {comm.description}
                    </p>
                  </div>
                </div>

                {/* Purchase CTA (Branch 2: Buy Template from Community -> Payment) */}
                <div className="mt-5 border-t border-stone-100 pt-3 flex items-center gap-2">
                  <Link
                    href={`/try/${comm.slug}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Preview</span>
                  </Link>

                  <button
                    onClick={() => buyCommunityTemplate(comm)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{comm.price === 0 ? "Get Free" : `Buy (₹${comm.price})`}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL 1: SHARE PREVIEW TO CUSTOMER (BRANCH 3B & 3A) ================= */}
      <AnimatePresence>
        {previewModalOpen && activePreviewTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-rose-600" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Share Client Confirmation Preview
                  </span>
                </div>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Client or Couple Name
                  </label>
                  <input
                    type="text"
                    value={previewCustomerName}
                    onChange={(e) => setPreviewCustomerName(e.target.value)}
                    placeholder="e.g. Aarav & Priya Wedding"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-stone-500">
                    This personalizes the watermarked draft link and welcome header for the customer.
                  </p>
                </div>

                {/* Generated Link Display */}
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>Generated Watermarked Preview Link</span>
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Draft Confirmation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getGeneratedPreviewUrl()}
                      className="w-full rounded-lg border border-stone-200 bg-white p-2 text-xs font-mono text-stone-600 select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(getGeneratedPreviewUrl())}
                      className="flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedLink ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Direct Share Channels */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Hello! Here is the custom wedding invitation draft preview: ${getGeneratedPreviewUrl()} - Tap to open with music & ceremony details.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Send via WhatsApp</span>
                  </a>

                  <a
                    href={getGeneratedPreviewUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-rose-600" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>

              {/* Bottom Next Step in Diagram */}
              <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Customer approved design?
                </span>
                <button
                  onClick={() => {
                    setPreviewModalOpen(false);
                    openSelectUsersTier(activePreviewTemplate);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-all cursor-pointer"
                >
                  <span>Select Users & License</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: SELECT HOW MUCH USERS (BRANCH 3A) ================= */}
      <AnimatePresence>
        {userTierModalOpen && selectedTemplateForTier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-rose-600" />
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900">
                      Select Guest Quota for {selectedTemplateForTier.name}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Step 3: Select how much users & license capacity before generating customer production access.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUserTierModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
                {GUEST_TIERS.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all relative ${
                        isSelected
                          ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-400 shadow-xs"
                          : "border-stone-200 bg-white hover:border-rose-300"
                      }`}
                    >
                      {tier.popular && (
                        <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-bold text-stone-900">{tier.name}</span>
                        <div className="text-right">
                          <span className="font-mono text-base font-bold text-stone-900">₹{tier.price}</span>
                          <span className="block text-[10px] text-stone-500">one-time</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs font-semibold text-rose-700 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Capacity: {typeof tier.capacity === "number" ? `${tier.capacity} Guests` : tier.capacity}</span>
                      </div>

                      <ul className="mt-3 space-y-1 text-[11px] text-stone-600">
                        {tier.features.map((f, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-stone-200 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-500">Selected Plan:</span>
                  <div className="text-sm font-bold text-stone-900">
                    {selectedTier.name} • ₹{selectedTier.price} INR
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserTierModalOpen(false)}
                    className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedToTierPayment}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Proceed to Payment</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 3: PAYMENT CHECKOUT ================= */}
      <AnimatePresence>
        {paymentModalOpen && paymentDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-rose-600" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Secure Payment Gateway
                  </span>
                </div>
                <button
                  disabled={isProcessingPayment}
                  onClick={() => setPaymentModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                    <span>Item / License</span>
                    <span>Amount</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-serif text-sm font-bold text-stone-900">
                        {paymentDetails.templateName}
                      </div>
                      <div className="text-[11px] text-rose-700 font-semibold">
                        {paymentDetails.type === "GUEST_TIER"
                          ? "Guest Capacity Quota License"
                          : "Community Template Commercial License"}
                      </div>
                    </div>
                    <div className="font-mono text-xl font-bold text-stone-900">
                      ₹{paymentDetails.amount}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                    Select Payment Method
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "upi", label: "Instant UPI (GPay, PhonePe, Paytm)", icon: "⚡" },
                      { id: "razorpay", label: "Credit / Debit Card / Net Banking", icon: "💳" },
                    ].map((opt, idx) => (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          idx === 0
                            ? "border-rose-500 bg-rose-50/50"
                            : "border-stone-200 bg-white hover:bg-stone-50"
                        }`}
                      >
                        <span className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        <CheckCircle2 className="h-4 w-4 text-rose-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pay Action Button */}
              <button
                disabled={isProcessingPayment}
                onClick={() =>
                  handlePaymentSuccess(
                    paymentDetails.type,
                    paymentDetails.targetId,
                    paymentDetails.templateName,
                    paymentDetails.amount
                  )
                }
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <span>Verifying Payment...</span>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Confirm & Pay ₹{paymentDetails.amount} INR</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 4: SHARE ACCESS TO CUSTOMER (BRANCH 3A FINAL) ================= */}
      <AnimatePresence>
        {customerAccessModalOpen && customerAccessData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-serif font-bold text-sm text-stone-900">
                    Payment Successful • Customer Access Ready
                  </span>
                </div>
                <button
                  onClick={() => setCustomerAccessModalOpen(false)}
                  className="rounded-lg p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="my-5 space-y-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Production Invitation Licensed</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">
                    Guest quota of <strong>{customerAccessData.guestQuota} Guests</strong> is now active for {customerAccessData.clientName}. Watermark removed.
                  </p>
                </div>

                {/* Customer Production Link & Admin PIN */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Customer Live Invitation URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={customerAccessData.url}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2 text-xs font-mono text-stone-800"
                      />
                      <button
                        onClick={() => copyToClipboard(customerAccessData.url)}
                        className="rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800"
                      >
                        {copiedLink ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Customer Management PIN / Access Code
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 font-mono text-sm font-bold text-rose-900">
                        {customerAccessData.pin}
                      </div>
                      <span className="text-xs text-stone-500">
                        Give this to the couple to view their live RSVPs.
                      </span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Handover Action */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `🎉 Congratulations! Your official wedding invitation is now live!\n\n🔗 Live Link: ${customerAccessData.url}\n🔑 Host Admin PIN: ${customerAccessData.pin}\n👥 Guest Quota: ${customerAccessData.guestQuota} Guests\n\nYou can share this link with all your guests on WhatsApp!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Complete Access to Customer on WhatsApp</span>
                </a>
              </div>

              <div className="border-t border-stone-200 pt-3 text-right">
                <button
                  onClick={() => setCustomerAccessModalOpen(false)}
                  className="rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

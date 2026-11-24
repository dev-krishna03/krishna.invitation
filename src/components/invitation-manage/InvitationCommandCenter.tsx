"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Share2,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Send,
  Plus,
  Trash2,
  FileSpreadsheet,
  Upload,
  Calendar,
  MapPin,
  Music,
  Sliders,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  QrCode,
  Smartphone,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { GuestCsvImporter } from "@/components/invite/GuestCsvImporter";
import { VersionHistoryDrawer } from "@/components/common/VersionHistoryDrawer";

type Guest = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  group_name: string | null;
  plus_allowed: number;
  rsvp_status: "PENDING" | "ACCEPTED" | "DECLINED" | "MAYBE";
  rsvp_at: string | null;
  rsvp_message: string | null;
  dietary_notes: string | null;
  viewed_at: string | null;
};

type Invitation = {
  id: string;
  title: string;
  slug: string;
  event_type: string;
  is_published: boolean;
  published_at: string | null;
  expires_at: string | null;
  view_count: number;
  data: Record<string, any>;
  music_url: string | null;
  template: {
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string | null;
  };
  guests: Guest[];
  _count?: {
    views: number;
    guests: number;
  };
};

export function InvitationCommandCenter({
  invitation,
  baseUrl,
}: {
  invitation: Invitation;
  baseUrl: string;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"whatsapp" | "editor" | "addons" | "analytics">("whatsapp");

  // Invitation state
  const [invData, setInvData] = useState<Record<string, any>>(invitation.data || {});
  const [invTitle, setInvTitle] = useState(invitation.title);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Guest list state
  const [guests, setGuests] = useState<Guest[]>(invitation.guests || []);
  const [searchGuest, setSearchGuest] = useState("");
  const [filterRsvp, setFilterRsvp] = useState<string>("ALL");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Modals state
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // New guest form
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState("");
  const [newGuestPlus, setNewGuestPlus] = useState(0);

  // CSV Import state
  const [csvText, setCsvText] = useState("");

  // Validity calculation
  const expiresAt = invitation.expires_at ? new Date(invitation.expires_at) : null;
  const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;
  const daysRemaining = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  // WhatsApp Message Template
  const [waTemplate, setWaTemplate] = useState(
    `Dear {guest_name}, you are cordially invited to celebrate our {event_title}! 🌸\n\nDate: {date}\nVenue: {venue}\n\nKindly view your personalized digital invitation and ceremony details here:\n{personalized_url}\n\nWith warm regards,\n{host_names}`
  );

  // Filtered guests
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchGuest.toLowerCase()) ||
        (g.phone && g.phone.includes(searchGuest)) ||
        (g.group_name && g.group_name.toLowerCase().includes(searchGuest.toLowerCase()));
      const matchStatus = filterRsvp === "ALL" || g.rsvp_status === filterRsvp;
      return matchSearch && matchStatus;
    });
  }, [guests, searchGuest, filterRsvp]);

  // RSVP summary
  const rsvpCounts = useMemo(() => {
    const acceptedGuests = guests.filter((g) => g.rsvp_status === "ACCEPTED");
    const totalHeadcount = acceptedGuests.reduce((acc, g) => acc + 1 + (g.plus_allowed || 0), 0);
    return {
      ACCEPTED: acceptedGuests.length,
      DECLINED: guests.filter((g) => g.rsvp_status === "DECLINED").length,
      MAYBE: guests.filter((g) => g.rsvp_status === "MAYBE").length,
      PENDING: guests.filter((g) => g.rsvp_status === "PENDING").length,
      TOTAL: guests.length,
      HEADCOUNT: totalHeadcount,
    };
  }, [guests]);

  // Copy helper
  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  }

  // Format WhatsApp link for a guest
  function getWhatsAppUrl(guest: Guest) {
    const primary = invData.primaryName || "";
    const secondary = invData.secondaryName || "";
    const hostNames = primary && secondary ? `${primary} & ${secondary}` : primary || secondary || "The Hosts";
    const dateVenue = invData.eventDate ? `${invData.eventDate} at ${invData.venueName || "Venue"}` : invData.venueName || "Venue";
    const personalizedUrl = `${baseUrl}/invite/${invitation.slug}/${guest.slug}`;

    const text = waTemplate
      .replace(/{guest_name}/g, guest.name)
      .replace(/{event_title}/g, invitation.title)
      .replace(/{date}/g, invData.eventDate || "Upcoming")
      .replace(/{venue}/g, invData.venueName || "Venue")
      .replace(/{personalized_url}/g, personalizedUrl)
      .replace(/{host_names}/g, hostNames);

    const cleanPhone = (guest.phone || "").replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  }

  // Add Single Guest
  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    try {
      const res = await fetch(`/api/invitations/${invitation.id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: [
            {
              name: newGuestName.trim(),
              phone: newGuestPhone.trim() || undefined,
              group_name: newGuestGroup.trim() || undefined,
              plus_allowed: Number(newGuestPlus) || 0,
            },
          ],
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setGuests((prev) => [...prev, ...d.guests]);
        setNewGuestName("");
        setNewGuestPhone("");
        setNewGuestGroup("");
        setNewGuestPlus(0);
        setIsAddGuestOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Batch CSV Import
  async function handleCsvImport(e: React.FormEvent) {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split("\n");
    const parsedGuests: Array<{ name: string; phone?: string; group_name?: string; plus_allowed?: number }> = [];

    for (const line of lines) {
      const parts = line.split(",").map((s) => s.trim());
      if (parts[0]) {
        parsedGuests.push({
          name: parts[0],
          phone: parts[1] || undefined,
          group_name: parts[2] || undefined,
          plus_allowed: parts[3] ? parseInt(parts[3], 10) : 0,
        });
      }
    }

    if (parsedGuests.length === 0) return;

    try {
      const res = await fetch(`/api/invitations/${invitation.id}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: parsedGuests }),
      });

      if (res.ok) {
        const d = await res.json();
        setGuests((prev) => [...prev, ...d.guests]);
        setCsvText("");
        setIsCsvImportOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Delete Guest
  async function handleDeleteGuest(guestId: string) {
    if (!confirm("Are you sure you want to remove this guest?")) return;
    try {
      const res = await fetch(`/api/invitations/${invitation.id}/guests?guestId=${guestId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setGuests((prev) => prev.filter((g) => g.id !== guestId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Export to CSV
  function exportGuestsToCsv() {
    const headers = ["Name", "Phone", "Group", "Plus Allowed", "RSVP Status", "Meal Preference / Notes", "Message", "Viewed", "Personal Link"];
    const rows = guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.phone || ""}"`,
      `"${g.group_name || ""}"`,
      g.plus_allowed,
      g.rsvp_status,
      `"${(g.dietary_notes || "").replace(/"/g, '""')}"`,
      `"${(g.rsvp_message || "").replace(/"/g, '""')}"`,
      g.viewed_at ? "Viewed" : "Unopened",
      `"${baseUrl}/invite/${invitation.slug}/${g.slug}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${invitation.slug}_guest_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Save Host Editor changes
  async function handleSaveHostEditor() {
    setIsSaving(true);
    setSaveSuccess(null);
    try {
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: invTitle,
          data: invData,
          is_published: true,
          gift_upi_id: invData.giftUpiId || null,
          gift_notes: invData.giftNotes || null,
          is_protected: invData.isProtected !== false,
        }),
      });

      if (res.ok) {
        setSaveSuccess("Changes published successfully!");
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  // Extend Validity
  async function handleExtendValidity(days: number) {
    try {
      const res = await fetch(`/api/invitations/${invitation.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (res.ok) {
        setIsExtendModalOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  }

  const commonLink = `${baseUrl}/invite/${invitation.slug}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Back to My Celebrations"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                {invitation.event_type}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  isExpired
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : invitation.is_published
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {!isExpired && invitation.is_published && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{isExpired ? "Expired (Ended)" : invitation.is_published ? "Live Online" : "Draft"}</span>
              </span>
            </div>
            <h1 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {invTitle}
            </h1>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsExtendModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Clock className="h-3.5 w-3.5 text-amber-700" />
            <span>
              {daysRemaining !== null
                ? `${daysRemaining} days left • Extend`
                : "Extend Validity"}
            </span>
          </button>

          <VersionHistoryDrawer entityType="INVITATION" entityId={invitation.id} />

          <Link
            href={`/invite/${invitation.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors shadow-2xs"
          >
            <Eye className="h-3.5 w-3.5 text-rose-600" />
            <span>Preview Guest Page</span>
            <ExternalLink className="h-3 w-3 text-stone-400" />
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "whatsapp"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          <span>WhatsApp Sharing & Guests ({guests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "editor"
              ? "border-rose-600 text-rose-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Sliders className="h-4 w-4 text-rose-600" />
          <span>Host Details Editor</span>
        </button>

        <button
          onClick={() => setActiveTab("addons")}
          className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "addons"
              ? "border-amber-600 text-amber-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Clock className="h-4 w-4 text-amber-600" />
          <span>Pay-by-Days & Add-ons</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs font-bold transition-all cursor-pointer ${
            activeTab === "analytics"
              ? "border-rose-600 text-rose-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Eye className="h-4 w-4 text-rose-600" />
          <span>Guest View Analytics ({invitation._count?.views || invitation.view_count || 0})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: WHATSAPP SHARING & GUEST LIST MANAGEMENT                 */}
      {/* ============================================================== */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-stone-400">Total Guests</span>
              <p className="mt-1 font-serif text-2xl font-bold text-stone-900">{rsvpCounts.TOTAL}</p>
              <span className="text-[10px] text-stone-500">{rsvpCounts.HEADCOUNT} total attending headcount</span>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-emerald-700">Attending (Yes)</span>
              <p className="mt-1 font-serif text-2xl font-bold text-emerald-800">{rsvpCounts.ACCEPTED}</p>
              <span className="text-[10px] text-emerald-600">Confirmed attendance</span>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-amber-700">Awaiting Reply</span>
              <p className="mt-1 font-serif text-2xl font-bold text-amber-800">{rsvpCounts.PENDING}</p>
              <span className="text-[10px] text-amber-600">Pending WhatsApp RSVP</span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-rose-700">Declined (No)</span>
              <p className="mt-1 font-serif text-2xl font-bold text-rose-800">{rsvpCounts.DECLINED}</p>
              <span className="text-[10px] text-rose-600">Regretfully absent</span>
            </div>

            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-rose-700">Card Views</span>
              <p className="mt-1 font-serif text-2xl font-bold text-rose-900">
                {invitation._count?.views || invitation.view_count || 0}
              </p>
              <span className="text-[10px] text-rose-600">Total guest visits</span>
            </div>
          </div>

          {/* Common Link & Instant Share Box */}
          <div className="rounded-3xl border border-stone-200 bg-gradient-to-br from-white via-stone-50 to-emerald-50/30 p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  General Invitation Link
                </span>
                <h3 className="mt-1.5 font-serif text-base font-bold text-stone-900">
                  Public Invitation Link (For Groups & Social Media)
                </h3>
                <p className="text-xs text-stone-500">
                  Anyone opening this link sees the general invitation card and can RSVP directly.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex-1 md:w-80 flex items-center rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-700 select-all overflow-hidden truncate">
                  {commonLink}
                </div>

                <button
                  onClick={() => copyText(commonLink, "common")}
                  className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                >
                  {copiedLink === "common" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink === "common" ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => setIsQrModalOpen(true)}
                  className="flex items-center justify-center h-8.5 w-8.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 transition-colors text-stone-700 cursor-pointer shrink-0"
                  title="View QR Code"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* WhatsApp Message Template Customizer */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <span>WhatsApp Delivery Message Template</span>
              </label>
              <span className="text-[10px] text-stone-400">
                Variables: &#123;guest_name&#125;, &#123;event_title&#125;, &#123;date&#125;, &#123;venue&#125;, &#123;personalized_url&#125;
              </span>
            </div>
            <textarea
              rows={3}
              value={waTemplate}
              onChange={(e) => setWaTemplate(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-800 font-sans focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Automatic Reminders & Broadcast Tools */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>RSVP Pending Reminders ({rsvpCounts.PENDING} Guests)</span>
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                  Awaiting Reply
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80">
                Send a polite reminder WhatsApp message with their unique personalized link to guests who haven&apos;t responded yet.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    setFilterRsvp("PENDING");
                    setWaTemplate(
                      "Namaste {guest_name}! 🙏 Just a gentle reminder regarding our celebration: {event_title} on {date}. Kindly let us know if you can join us by clicking your personalized invitation: {personalized_url}"
                    );
                  }}
                  className="rounded-full bg-amber-700 text-white px-4 py-1.5 text-xs font-semibold hover:bg-amber-800 transition-colors cursor-pointer"
                >
                  Load Reminder Template &amp; Filter Pending
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span>Day-Before Venue &amp; Map Broadcast</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  Confirmed Guests ({rsvpCounts.ACCEPTED})
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/80">
                Send venue address, Google Maps 1-tap navigation pin, and countdown timings to confirmed guests.
              </p>
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    setFilterRsvp("ACCEPTED");
                    setWaTemplate(
                      "Namaste {guest_name}! 🎉 We look forward to welcoming you tomorrow to {event_title} at {venue}! Tap here for one-click Google Maps directions and live schedule: {personalized_url}"
                    );
                  }}
                  className="rounded-full bg-emerald-700 text-white px-4 py-1.5 text-xs font-semibold hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Load Day-Before Venue Template
                </button>
              </div>
            </div>
          </div>

          {/* Guests Management Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search guest by name, phone or group..."
                value={searchGuest}
                onChange={(e) => setSearchGuest(e.target.value)}
                className="w-full md:w-64 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-rose-500"
              />

              <select
                value={filterRsvp}
                onChange={(e) => setFilterRsvp(e.target.value)}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none"
              >
                <option value="ALL">All RSVPs ({guests.length})</option>
                <option value="ACCEPTED">Attending ({rsvpCounts.ACCEPTED})</option>
                <option value="PENDING">Pending Reply ({rsvpCounts.PENDING})</option>
                <option value="DECLINED">Declined ({rsvpCounts.DECLINED})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
              <button
                onClick={() => setIsAddGuestOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Guest</span>
              </button>

              <GuestCsvImporter
                invitationId={invitation.id}
                onImportComplete={() => router.refresh()}
              />

              <button
                onClick={exportGuestsToCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export Excel/CSV</span>
              </button>
            </div>
          </div>

          {/* Guest Table */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  <tr>
                    <th className="py-3 px-4">Guest Name & Group</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">Personalized Link</th>
                    <th className="py-3 px-3">Status / Viewed</th>
                    <th className="py-3 px-3">RSVP Response</th>
                    <th className="py-3 px-4 text-right">Send via WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-stone-400">
                        <Users className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                        <p className="font-semibold text-stone-700">No guests found</p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Add your first guest or import from CSV to generate personalized WhatsApp links.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map((guest) => {
                      const guestLink = `${baseUrl}/invite/${invitation.slug}/${guest.slug}`;
                      const waUrl = getWhatsAppUrl(guest);

                      return (
                        <tr key={guest.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3 px-4 font-semibold text-stone-900">
                            <div>{guest.name}</div>
                            {guest.group_name && (
                              <span className="text-[10px] text-rose-700 font-normal">
                                {guest.group_name}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-stone-600 font-mono text-[11px]">
                            {guest.phone || <span className="text-stone-300">—</span>}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-stone-500 truncate max-w-[140px]">
                                /{guest.slug}
                              </span>
                              <button
                                onClick={() => copyText(guestLink, guest.id)}
                                className="rounded p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                                title="Copy personal link"
                              >
                                {copiedLink === guest.id ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            {guest.viewed_at ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Opened</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-400">Unopened</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                guest.rsvp_status === "ACCEPTED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : guest.rsvp_status === "DECLINED"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : guest.rsvp_status === "MAYBE"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-stone-100 text-stone-500"
                              }`}
                            >
                              {guest.rsvp_status === "ACCEPTED"
                                ? `Attending (${1 + (guest.plus_allowed || 0)})`
                                : guest.rsvp_status}
                            </span>
                            {guest.rsvp_message && (
                              <div className="text-[10px] text-stone-500 italic mt-0.5 truncate max-w-[150px]">
                                &ldquo;{guest.rsvp_message}&rdquo;
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-[11px] font-bold text-white shadow-2xs transition-colors"
                              >
                                <Send className="h-3 w-3" />
                                <span>WhatsApp</span>
                              </a>

                              <button
                                onClick={() => handleDeleteGuest(guest.id)}
                                className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove guest"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: HOST DETAILS FORM EDITOR (WITH LIVE MOBILE PREVIEW)     */}
      {/* ============================================================== */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-7 rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Invitation Customizer
                </h3>
                <p className="text-xs text-stone-500">
                  Update event details, wording, and ceremonies. Your design layout remains perfectly preserved.
                </p>
              </div>

              <button
                onClick={handleSaveHostEditor}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isSaving ? "Saving..." : "Publish Edits"}</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* 1. Couple / Host Names */}
            <div className="space-y-4">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                1. Names & Cultural Invocations
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Sacred Header / Invocation
                </label>
                <input
                  type="text"
                  value={invData.invocation || "श्री गणेशाय नमः"}
                  onChange={(e) => setInvData({ ...invData, invocation: e.target.value })}
                  placeholder="e.g. श्री गणेशाय नमः or Together with our families"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Primary Name (e.g. Groom / Host)
                  </label>
                  <input
                    type="text"
                    value={invData.primaryName || ""}
                    onChange={(e) => setInvData({ ...invData, primaryName: e.target.value })}
                    placeholder="Aarav Mehta"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Secondary Name (e.g. Bride / Honoree)
                  </label>
                  <input
                    type="text"
                    value={invData.secondaryName || ""}
                    onChange={(e) => setInvData({ ...invData, secondaryName: e.target.value })}
                    placeholder="Priya Sharma"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 2. Date, Time & Venue */}
            <div className="space-y-4 pt-2 border-t border-stone-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                2. Date & Venue Location
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Celebration Date
                  </label>
                  <input
                    type="text"
                    value={invData.eventDate || "12 December 2026"}
                    onChange={(e) => setInvData({ ...invData, eventDate: e.target.value })}
                    placeholder="e.g. 12 December 2026"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Ceremony Time
                  </label>
                  <input
                    type="text"
                    value={invData.eventTime || "7:00 PM Onwards"}
                    onChange={(e) => setInvData({ ...invData, eventTime: e.target.value })}
                    placeholder="e.g. 7:00 PM Onwards"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Venue Name
                </label>
                <input
                  type="text"
                  value={invData.venueName || "The Imperial Palace Grounds"}
                  onChange={(e) => setInvData({ ...invData, venueName: e.target.value })}
                  placeholder="e.g. The Imperial Palace Grounds"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Full Address
                </label>
                <input
                  type="text"
                  value={invData.venueAddress || "Lake Pichola Road, Udaipur, Rajasthan"}
                  onChange={(e) => setInvData({ ...invData, venueAddress: e.target.value })}
                  placeholder="Full physical address"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Google Maps Directions Link
                </label>
                <input
                  type="url"
                  value={invData.mapUrl || "https://maps.google.com"}
                  onChange={(e) => setInvData({ ...invData, mapUrl: e.target.value })}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* 3. Welcome Message & Family Details */}
            <div className="space-y-4 pt-2 border-t border-stone-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                3. Wording & Family Blessings
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Cordial Welcome Message
                </label>
                <textarea
                  rows={3}
                  value={
                    invData.welcomeMessage ||
                    "We cordially invite you to join us in celebrating the holy matrimony and shower your auspicious blessings on the new couple."
                  }
                  onChange={(e) => setInvData({ ...invData, welcomeMessage: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Family Blessings (With best compliments from)
                </label>
                <input
                  type="text"
                  value={invData.familyBlessings || "With best compliments from Mehta & Sharma Families"}
                  onChange={(e) => setInvData({ ...invData, familyBlessings: e.target.value })}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 4. Section Toggles */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                4. Features & Section Toggles
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.showRsvp !== false}
                    onChange={(e) => setInvData({ ...invData, showRsvp: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Show RSVP Form</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.showMusic !== false}
                    onChange={(e) => setInvData({ ...invData, showMusic: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Background Music</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.showMap !== false}
                    onChange={(e) => setInvData({ ...invData, showMap: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Google Map Button</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.showCountdown !== false}
                    onChange={(e) => setInvData({ ...invData, showCountdown: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Event Countdown</span>
                </label>
              </div>
            </div>

            {/* 5. Digital Shagun & Blessings */}
            <div className="space-y-4 pt-2 border-t border-stone-100">
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">
                5. Digital Shagun, Cash Gifts &amp; Protection
              </span>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  UPI ID for Digital Shagun / Blessings (Optional)
                </label>
                <input
                  type="text"
                  value={invData.giftUpiId || ""}
                  onChange={(e) => setInvData({ ...invData, giftUpiId: e.target.value })}
                  placeholder="e.g. aaravpriya@okhdfcbank"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Enables 1-tap UPI payment with Google Pay, PhonePe, and Paytm on the guest invitation page.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                  Shagun Note / Wording
                </label>
                <input
                  type="text"
                  value={invData.giftNotes || ""}
                  onChange={(e) => setInvData({ ...invData, giftNotes: e.target.value })}
                  placeholder="e.g. Your blessings are our greatest gift. Should you wish to send shagun:"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.showWishWall !== false}
                    onChange={(e) => setInvData({ ...invData, showWishWall: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Photo &amp; Heartfelt Wish Wall</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invData.isProtected !== false}
                    onChange={(e) => setInvData({ ...invData, isProtected: e.target.checked })}
                    className="accent-rose-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Anti-Download Protection</span>
                </label>
              </div>
            </div>
          </div>

          {/* Live Mobile Frame Preview */}
          <div className="lg:col-span-5 sticky top-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-rose-600" />
                <span>Live Interactive Preview</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Real-Time Updates
              </span>
            </div>

            <div className="mx-auto w-[320px] rounded-[38px] border-[8px] border-stone-900 bg-white shadow-2xl overflow-hidden aspect-[9/18] flex flex-col justify-between">
              {/* Notch */}
              <div className="h-5 w-full bg-stone-900 flex justify-center items-center">
                <div className="h-2.5 w-20 rounded-full bg-stone-800" />
              </div>

              {/* Preview Body */}
              <div className="flex-1 overflow-y-auto p-5 text-center bg-gradient-to-b from-[#FBF2E8] via-[#FAF3EA] to-[#F2DCC8] text-stone-900 space-y-4">
                <span className="text-xs font-serif text-amber-800 font-bold block">
                  {invData.invocation || "श्री गणेशाय नमः"}
                </span>

                <div className="text-lg font-serif font-bold text-stone-900 leading-tight">
                  {invData.primaryName || "Aarav Mehta"}
                  <span className="block text-sm font-normal text-amber-700 my-1">&amp;</span>
                  {invData.secondaryName || "Priya Sharma"}
                </div>

                <div className="text-[10px] text-stone-600 leading-relaxed px-2">
                  {invData.welcomeMessage || "We cordially invite you to celebrate our holy union."}
                </div>

                <div className="rounded-xl border border-amber-300/60 bg-white/70 p-2.5 text-[10px] space-y-1">
                  <div className="font-bold text-stone-800 flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-600" />
                    <span>{invData.eventDate || "12 December 2026"}</span>
                  </div>
                  <div className="text-stone-600 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3 text-amber-600" />
                    <span>{invData.venueName || "Imperial Palace Grounds"}</span>
                  </div>
                </div>

                {invData.showRsvp !== false && (
                  <div className="rounded-xl bg-rose-600 text-white p-2 text-[10px] font-bold">
                    RSVP Enabled • Guests Respond Here
                  </div>
                )}
              </div>

              {/* Home indicator bar */}
              <div className="h-4 w-full bg-stone-900 flex justify-center items-center">
                <div className="h-1 w-24 rounded-full bg-stone-700" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PAY-BY-DAYS & ADD-ONS                                   */}
      {/* ============================================================== */}
      {activeTab === "addons" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Pay-by-Days Validity Plans
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Digital invitations stay active for your chosen validity window. Extend anytime to keep RSVPs open!
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6">
              {[
                { name: "Basic", days: 15, mult: "1.0x", price: 999, updates: "1 Live Update", links: "5 Personal Links" },
                { name: "Standard", days: 30, mult: "1.5x", price: 1499, updates: "3 Live Updates", links: "25 Personal Links", tag: "Most Popular" },
                { name: "Premium", days: 90, mult: "2.5x", price: 2499, updates: "10 Live Updates", links: "100 Personal Links" },
                { name: "Extended", days: 180, mult: "3.5x", price: 3499, updates: "Unlimited Updates", links: "Unlimited Links" },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 flex flex-col justify-between hover:border-rose-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-base font-bold text-stone-900">{plan.name}</span>
                      {plan.tag && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          {plan.tag}
                        </span>
                      )}
                    </div>
                    <p className="font-serif text-2xl font-bold text-rose-950">₹{plan.price.toLocaleString()}</p>
                    <span className="text-[11px] text-stone-500 font-semibold">{plan.days} Days Validity ({plan.mult})</span>

                    <ul className="mt-4 space-y-1.5 text-xs text-stone-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{plan.updates}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>{plan.links}</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>WhatsApp Personalized Sending</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleExtendValidity(plan.days)}
                    className="mt-6 w-full rounded-xl bg-stone-900 hover:bg-stone-800 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Extend +{plan.days} Days
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: GUEST VIEW ANALYTICS                                    */}
      {/* ============================================================== */}
      {activeTab === "analytics" && (
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Guest Engagement & View Log
            </h3>
            <p className="mt-1 text-xs text-stone-500">
              Track how many guests have opened and interacted with your invitation card.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-xs font-bold uppercase text-stone-400">Total Visits</span>
              <p className="mt-1 font-serif text-3xl font-bold text-stone-900">
                {invitation._count?.views || invitation.view_count || 0}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-xs font-bold uppercase text-stone-400">Personalized Guests Opened</span>
              <p className="mt-1 font-serif text-3xl font-bold text-emerald-700">
                {guests.filter((g) => g.viewed_at).length}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <span className="text-xs font-bold uppercase text-stone-400">Response Rate</span>
              <p className="mt-1 font-serif text-3xl font-bold text-rose-700">
                {guests.length > 0 ? Math.round(((guests.length - rsvpCounts.PENDING) / guests.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: ADD GUEST ================= */}
      {isAddGuestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Add New Guest</h3>
              <button onClick={() => setIsAddGuestOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Guest Full Name *</label>
                <input
                  type="text"
                  required
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g. Ramesh & Sunita Sharma"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  value={newGuestPhone}
                  onChange={(e) => setNewGuestPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Family / Group Tag</label>
                  <input
                    type="text"
                    value={newGuestGroup}
                    onChange={(e) => setNewGuestGroup(e.target.value)}
                    placeholder="e.g. Groom Family"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Plus-ones (+1s allowed)</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={newGuestPlus}
                    onChange={(e) => setNewGuestPlus(Number(e.target.value))}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 focus:bg-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Add Guest to List
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: BATCH CSV IMPORT ================= */}
      {isCsvImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Batch Import Guests (CSV)</h3>
              <button onClick={() => setIsCsvImportOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <form onSubmit={handleCsvImport} className="space-y-3 text-xs">
              <p className="text-stone-500 text-[11px]">
                Paste rows with format: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">Name, Phone, Group, PlusOnes</code>
              </p>
              <textarea
                rows={6}
                required
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Ramesh Sharma, 9876543210, Groom Family, 2&#10;Sunita Verma, 9812345678, Bride College, 1&#10;Kunal Patel, 9765432109, Friends, 0"
                className="w-full font-mono rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-xs text-stone-800 focus:bg-white focus:border-rose-500 focus:outline-none"
              />

              <button
                type="submit"
                className="w-full mt-2 rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 font-bold text-white transition-colors cursor-pointer shadow-xs"
              >
                Import Guests
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: EXTEND VALIDITY ================= */}
      {isExtendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Extend Card Validity</h3>
              <button onClick={() => setIsExtendModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <p className="text-xs text-stone-600">
              Keep your digital invitation active so guests can continue viewing ceremony details and submitting RSVPs.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => handleExtendValidity(15)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:border-rose-400 hover:bg-rose-50/40 transition-all cursor-pointer text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 block">+15 Days Extension</span>
                  <span className="text-[11px] text-stone-500">Quick wedding ceremony extension</span>
                </div>
                <span className="font-serif font-bold text-rose-700 text-sm">₹499</span>
              </button>

              <button
                onClick={() => handleExtendValidity(30)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-rose-300 bg-rose-50/50 hover:bg-rose-50 transition-all cursor-pointer text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">+30 Days Extension</span>
                    <span className="text-[9px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-full">Recommended</span>
                  </div>
                  <span className="text-[11px] text-stone-500">Full month coverage with photo galleries</span>
                </div>
                <span className="font-serif font-bold text-rose-700 text-sm">₹799</span>
              </button>

              <button
                onClick={() => handleExtendValidity(90)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-stone-200 bg-stone-50 hover:border-rose-400 hover:bg-rose-50/40 transition-all cursor-pointer text-xs"
              >
                <div>
                  <span className="font-bold text-stone-900 block">+90 Days Extension</span>
                  <span className="text-[11px] text-stone-500">Long-term celebration memories</span>
                </div>
                <span className="font-serif font-bold text-rose-700 text-sm">₹1,499</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: QR CODE ================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 text-center space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">Invitation QR Code</h3>
              <button onClick={() => setIsQrModalOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>

            <div className="p-4 bg-stone-50 rounded-2xl inline-block border border-stone-200 mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(commonLink)}`}
                alt="QR Code"
                className="h-44 w-44 mx-auto rounded-lg"
              />
            </div>

            <p className="text-xs text-stone-500">
              Scan with any mobile camera to open this invitation directly.
            </p>

            <button
              onClick={() => copyText(commonLink, "qr_copy")}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 py-2.5 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              {copiedLink === "qr_copy" ? "Link Copied!" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

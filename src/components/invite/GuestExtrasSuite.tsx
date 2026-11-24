"use client";

import { useState } from "react";
import {
  Heart,
  QrCode,
  Sparkles,
  Utensils,
  Plane,
  Users,
  Camera,
  Download,
  Share2,
  Calendar,
  CheckCircle2,
  Send,
  Languages,
} from "lucide-react";

type EventItem = {
  id: string;
  name: string;
  venue: string | null;
  date: string | null;
  start_time: string | null;
  end_time: string | null;
};

type WishItem = {
  id: string;
  author_name: string;
  message: string;
  photo_url?: string | null;
  created_at: string;
};

type Props = {
  invitationId: string;
  slug: string;
  title: string;
  events: EventItem[];
  guest?: {
    id: string;
    name: string;
    slug: string;
    invited_events: string[];
    is_family: boolean;
    family_members: string[];
    meal_preference: string | null;
    plus_count: number;
    travel_details: any;
  } | null;
  initialWishes?: WishItem[];
  giftUpiId?: string | null;
  giftNotes?: string | null;
  fontFamily?: string;
};

const TRANSLATIONS = {
  en: {
    ceremonies: "Ceremonies & Functions",
    rsvpTitle: "RSVP & Preferences",
    familyGroup: "Family Group RSVP",
    familyNote: "This invitation covers all members of your family.",
    mealTitle: "Meal Preference",
    travelTitle: "Travel & Stay Details",
    shagunTitle: "Digital Shagun & Blessings",
    shagunSubtitle: "Send wedding blessings directly via UPI",
    wishWallTitle: "Photo & Heartfelt Wish Wall",
    wishWallSubtitle: "Share your blessings and memories with the couple",
    postWish: "Post Blessing",
    offlineTitle: "Save Offline Invitation Card",
  },
  gu: {
    ceremonies: "માંગલિક પ્રસંગો અને કાર્યક્રમ",
    rsvpTitle: "ઉપસ્થિતિ અને ભોજન પસંદગી (RSVP)",
    familyGroup: "સકુટુંબ આમંત્રણ",
    familyNote: "આ આમંત્રણ આપના સમગ્ર પરિવાર માટે માન્ય છે.",
    mealTitle: "ભોજન વ્યવસ્થા",
    travelTitle: "આગમન અને રહેવાની વિગત",
    shagunTitle: "ડિજિટલ શગુન અને આશીર્વાદ",
    shagunSubtitle: "UPI દ્વારા વર-વધૂને સીધા આશીર્વાદ મોકલો",
    wishWallTitle: "શુભેચ્છા દીવાલ અને ફોટા",
    wishWallSubtitle: "નવદંપતી માટે આપના સ્નેહભર્યા આશીર્વાદ લખો",
    postWish: "શુભેચ્છા મોકલો",
    offlineTitle: "ઓફલાઇન આમંત્રણ પત્રિકા ડાઉનલોડ કરો",
  },
  hi: {
    ceremonies: "मांगलिक कार्यक्रम व उत्सव",
    rsvpTitle: "उपस्थिति एवं भोजन वरीयता (RSVP)",
    familyGroup: "सपरिवार निमंत्रण",
    familyNote: "यह निमंत्रण आपके पूरे परिवार के लिए है।",
    mealTitle: "भोजन प्रबंध",
    travelTitle: "आगमन एवं आवास विवरण",
    shagunTitle: "डिजिटल शगुन एवं आशीर्वाद",
    shagunSubtitle: "UPI द्वारा सीधे नवदंपति को आशीर्वाद भेजें",
    wishWallTitle: "शुभकामना संदेश व फोटो दीवार",
    wishWallSubtitle: "वर-वधू को अपने स्नेहभरे आशीर्वाद प्रेषित करें",
    postWish: "आशीर्वाद भेजें",
    offlineTitle: "ऑफलाइन निमंत्रण पत्रिका डाउनलोड करें",
  },
};

export function GuestExtrasSuite({
  invitationId,
  slug,
  title,
  events,
  guest,
  initialWishes = [],
  giftUpiId,
  giftNotes,
}: Props) {
  const [locale, setLocale] = useState<"en" | "gu" | "hi">("en");
  const t = TRANSLATIONS[locale];

  // Meal & Travel states
  const [mealPref, setMealPref] = useState(guest?.meal_preference || "Pure Veg");
  const [travelNotes, setTravelNotes] = useState("");
  const [rsvpSaved, setRsvpSaved] = useState(false);

  // Wish wall states
  const [wishes, setWishes] = useState<WishItem[]>(initialWishes);
  const [authorName, setAuthorName] = useState(guest?.name || "");
  const [wishMsg, setWishMsg] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submittingWish, setSubmittingWish] = useState(false);
  const [wishStatus, setWishStatus] = useState<string | null>(null);

  // Filter events: If guest has invited_events, show only those; otherwise show all
  const visibleEvents =
    guest?.invited_events && guest.invited_events.length > 0
      ? events.filter((e) => guest.invited_events.includes(e.id) || guest.invited_events.includes(e.name))
      : events;

  async function postWish(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName || !wishMsg) return;
    setSubmittingWish(true);
    setWishStatus(null);
    try {
      const res = await fetch(`/api/invitations/${invitationId}/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName,
          message: wishMsg,
          photo_url: photoUrl || null,
          guest_id: guest?.id,
        }),
      });
      const d = await res.json();
      if (d.ok && d.wish) {
        if (!d.moderated) {
          setWishes([d.wish, ...wishes]);
        }
        setWishStatus(d.message || "Blessing posted!");
        setWishMsg("");
        setPhotoUrl("");
      }
    } catch (err) {
      setWishStatus("Failed to post wish. Please try again.");
    } finally {
      setSubmittingWish(false);
    }
  }

  function printOfflineCard() {
    window.print();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8 font-sans">
      {/* Multilingual Selector */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5D9FC] bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#12042F]">
          <Languages className="h-4 w-4 text-[#6520EE]" />
          <span>Language / ભાષા / भाषा:</span>
        </div>
        <div className="flex gap-1">
          {[
            { id: "en", label: "English" },
            { id: "gu", label: "ગુજરાતી" },
            { id: "hi", label: "हिंदी" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => setLocale(l.id as any)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                locale === l.id
                  ? "bg-[#6520EE] text-white shadow-xs"
                  : "bg-[#F5F1FE] text-[#12042F] hover:bg-[#EDE8F5]"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-Event Scoped Ceremonies */}
      {visibleEvents.length > 0 && (
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#6520EE]" />
              {t.ceremonies}
            </h2>
            {guest && (
              <span className="rounded-full bg-[#F5F1FE] px-2.5 py-0.5 text-[10px] font-bold text-[#6520EE]">
                Personalized for {guest.name}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {visibleEvents.map((ev) => (
              <div
                key={ev.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs"
              >
                <div>
                  <span className="font-bold text-sm text-[#12042F] block">{ev.name}</span>
                  {ev.venue && <span className="text-stone-600 block mt-0.5">📍 {ev.venue}</span>}
                </div>
                <div className="text-right sm:self-center">
                  <span className="font-semibold text-[#6520EE] block">
                    {ev.date ? new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  </span>
                  {ev.start_time && <span className="text-stone-400 text-[11px]">{ev.start_time}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Family Group & Meal Preference Card */}
      {guest && (
        <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#6520EE]" />
            {t.rsvpTitle}
          </h2>

          {guest.is_family && (
            <div className="rounded-2xl bg-[#F5F1FE] border border-[#E5D9FC] p-4 text-xs space-y-2">
              <span className="font-bold text-[#12042F] block flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#6520EE]" />
                {t.familyGroup}
              </span>
              <p className="text-stone-600 text-[11px]">{t.familyNote}</p>
              {guest.family_members && guest.family_members.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {guest.family_members.map((mem, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-stone-700 border border-[#E5D9FC]"
                    >
                      {mem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Meal Preference */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#12042F] block flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-[#6520EE]" />
              {t.mealTitle}
            </span>
            <div className="flex gap-2 flex-wrap">
              {["Jain", "Pure Veg", "Non-Veg", "Vegan"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMealPref(m)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    mealPref === m
                      ? "bg-[#6520EE] text-white"
                      : "bg-[#FAF9FD] border border-[#E5D9FC] text-stone-700 hover:bg-[#F5F1FE]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Travel / Stay details */}
          <div className="space-y-1.5 pt-2">
            <span className="text-xs font-semibold text-[#12042F] block flex items-center gap-1.5">
              <Plane className="h-3.5 w-3.5 text-[#6520EE]" />
              {t.travelTitle}
            </span>
            <input
              placeholder="e.g. Flight 6E-542 arriving 11 Dec 4:00 PM, Need airport pickup"
              value={travelNotes}
              onChange={(e) => setTravelNotes(e.target.value)}
              className="w-full rounded-2xl border border-[#E5D9FC] p-3 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
            />
          </div>

          <button
            onClick={() => setRsvpSaved(true)}
            className="rounded-full bg-[#12042F] px-5 py-2 text-xs font-semibold text-white hover:bg-[#6520EE] transition-colors"
          >
            {rsvpSaved ? "✓ Preferences Saved" : "Save Preferences"}
          </button>
        </div>
      )}

      {/* Digital Shagun / Cash Gift Link */}
      {giftUpiId && (
        <div className="rounded-3xl border border-[#E5D9FC] bg-gradient-to-br from-white to-[#F5F1FE]/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                {t.shagunTitle}
              </h2>
              <p className="text-xs text-[#7A7387]">{t.shagunSubtitle}</p>
            </div>
            <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold">
              Digital Shagun
            </span>
          </div>

          {giftNotes && <p className="text-xs text-stone-600 italic">&ldquo;{giftNotes}&rdquo;</p>}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#E5D9FC]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5F1FE] text-[#6520EE] border border-[#E5D9FC]">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-stone-400 block uppercase">UPI ID</span>
                <span className="font-mono text-sm font-bold text-[#12042F]">{giftUpiId}</span>
              </div>
            </div>

            <a
              href={`upi://pay?pa=${encodeURIComponent(giftUpiId)}&pn=${encodeURIComponent(
                title
              )}&cu=INR&tn=${encodeURIComponent("Wedding Blessings & Shagun")}`}
              className="rounded-full bg-[#6520EE] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5213D2] transition-colors text-center shadow-xs"
            >
              Pay via GPay / PhonePe / Paytm
            </a>
          </div>
        </div>
      )}

      {/* Photo & Heartfelt Wish Wall */}
      <div className="rounded-3xl border border-[#E5D9FC] bg-white p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-[#12042F] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6520EE]" />
            {t.wishWallTitle}
          </h2>
          <p className="text-xs text-[#7A7387]">{t.wishWallSubtitle}</p>
        </div>

        {/* Post a blessing form */}
        <form onSubmit={postWish} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 space-y-3">
          <input
            placeholder="Your name / Family name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
          />
          <textarea
            placeholder="Write your heartfelt blessing or memorable wish..."
            value={wishMsg}
            onChange={(e) => setWishMsg(e.target.value)}
            required
            rows={2}
            className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2.5 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
          />
          <input
            placeholder="Optional photo URL (e.g. memory with the couple)"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            className="w-full rounded-xl border border-[#E5D9FC] bg-white p-2 text-xs text-[#12042F] focus:outline-none focus:border-[#6520EE]"
          />

          <div className="flex items-center justify-between pt-1">
            {wishStatus && <span className="text-[11px] font-medium text-[#6520EE]">{wishStatus}</span>}
            <button
              type="submit"
              disabled={submittingWish}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#6520EE] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5213D2] transition-colors"
            >
              <Send className="h-3 w-3" />
              <span>{t.postWish}</span>
            </button>
          </div>
        </form>

        {/* Wishes List */}
        <div className="space-y-3">
          {wishes.map((w) => (
            <div key={w.id} className="rounded-2xl border border-[#E5D9FC] bg-[#FAF9FD] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#12042F]">{w.author_name}</span>
                <span className="text-[10px] text-stone-400">
                  {new Date(w.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-stone-700 leading-relaxed">&ldquo;{w.message}&rdquo;</p>
              {w.photo_url && (
                <img
                  src={w.photo_url}
                  alt="Guest memory"
                  className="rounded-xl max-h-48 w-full object-cover border border-[#E5D9FC]"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Offline Friendly Export Button */}
      <div className="text-center pt-2">
        <button
          onClick={printOfflineCard}
          className="inline-flex items-center gap-2 rounded-full border border-[#E5D9FC] bg-white px-6 py-2.5 text-xs font-semibold text-[#12042F] hover:bg-[#F5F1FE] transition-colors shadow-xs"
        >
          <Download className="h-4 w-4 text-[#6520EE]" />
          <span>{t.offlineTitle}</span>
        </button>
      </div>
    </div>
  );
}

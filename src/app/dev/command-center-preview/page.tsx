import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { InvitationCommandCenter } from "@/components/invitation-manage/InvitationCommandCenter";

export default async function DevCommandCenterPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;

  const mockInvitation = {
    id: "dev-mock-invitation-1",
    title: "Aarav & Priya • Royal Palace Wedding",
    slug: "aarav-priya-royal-wedding",
    event_type: "wedding",
    is_published: true,
    published_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(), // 24 days left
    view_count: 142,
    data: {
      invocation: "॥ श्री गणेशाय नमः ॥",
      primaryName: "Aarav Mehta",
      secondaryName: "Priya Sharma",
      eventDate: "12 December 2026",
      eventTime: "7:00 PM Onwards",
      venueName: "The Imperial Palace Grounds",
      venueAddress: "Lake Pichola Road, Udaipur, Rajasthan",
      welcomeMessage: "Together with our families, we cordially invite you to celebrate our holy union and grace the auspicious pheras with your warm presence.",
      familyBlessings: "With best compliments from Mehta & Sharma Families",
      mapUrl: "https://maps.google.com/?q=Imperial+Palace+Udaipur",
      showRsvp: true,
      showMusic: true,
      showMap: true,
      showCountdown: true,
    },
    music_url: "/audio/presets/shehnai-wedding.wav",
    template: {
      id: "royal-elegance",
      name: "Imperial Wine & Gold",
      slug: "royal-elegance",
      thumbnail_url: null,
    },
    guests: [
      {
        id: "guest-1",
        name: "Ramesh & Sunita Sharma",
        slug: "sharma-family",
        phone: "+91 98765 43210",
        email: "sharma@example.com",
        group_name: "Groom Family",
        plus_allowed: 2,
        rsvp_status: "ACCEPTED" as const,
        rsvp_at: new Date().toISOString(),
        rsvp_message: "Hearty congratulations! Looking forward to attending.",
        dietary_notes: "Vegetarian",
        viewed_at: new Date().toISOString(),
      },
      {
        id: "guest-2",
        name: "Dr. Kunal Verma & Family",
        slug: "kunal-verma",
        phone: "+91 98123 45678",
        email: "verma@example.com",
        group_name: "Bride College",
        plus_allowed: 1,
        rsvp_status: "PENDING" as const,
        rsvp_at: null,
        rsvp_message: null,
        dietary_notes: null,
        viewed_at: null,
      },
      {
        id: "guest-3",
        name: "Anjali & Siddharth Rao",
        slug: "anjali-siddharth",
        phone: "+91 97654 32109",
        email: "siddharth@example.com",
        group_name: "Close Friends",
        plus_allowed: 0,
        rsvp_status: "ACCEPTED" as const,
        rsvp_at: new Date().toISOString(),
        rsvp_message: "Cannot wait for the Sangeet dance night!",
        dietary_notes: null,
        viewed_at: new Date().toISOString(),
      },
      {
        id: "guest-4",
        name: "Vikram Malhotra",
        slug: "vikram-malhotra",
        phone: "+91 91234 56780",
        email: "vikram@example.com",
        group_name: "School Friends",
        plus_allowed: 0,
        rsvp_status: "DECLINED" as const,
        rsvp_at: new Date().toISOString(),
        rsvp_message: "Sending warmest blessings from overseas!",
        dietary_notes: null,
        viewed_at: new Date().toISOString(),
      },
    ],
    _count: {
      views: 142,
      guests: 4,
    },
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] p-4 sm:p-8">
      <div className="mb-4 rounded-xl border border-purple-200 bg-purple-50 p-3 text-xs text-purple-900 flex items-center justify-between">
        <span>
          <strong>Live Preview Mode:</strong> This renders the Host Invitation Command Center with WhatsApp Sharing, Host Editor, and Pay-by-Days Extensions.
        </span>
        <span className="font-mono text-[10px] bg-purple-200/80 px-2 py-0.5 rounded">
          /dashboard/invitations/[id]
        </span>
      </div>

      <InvitationCommandCenter invitation={mockInvitation} baseUrl={baseUrl} />
    </main>
  );
}
